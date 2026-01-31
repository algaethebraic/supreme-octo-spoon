import { writable, derived } from 'svelte/store';
import type { WikiPageMap, WikiBackupHistory, WikiBackup } from '$lib/types';
import {
  loadPagesFromStorage,
  savePagesToStorage,
  loadBackupHistoryFromStorage,
  saveBackupHistoryToStorage,
  createBackupEntry,
  addBackupToHistory,
  exportDataAsJson,
  parseImportedJson
} from '$lib/storage/persistence';
import {
  applyMigrations,
  validatePagesMap
} from '$lib/storage/migration';
import { HOME_PAGE_TITLE, DEFAULT_HOME_CONTENT } from '$lib/constants';

// Legacy export for backward compatibility
export type WikiPage = { title: string; content: string };

/**
 * Initialize pages store with data from localStorage
 */
function initializePagesStore(): WikiPageMap {
  const stored = loadPagesFromStorage();

  if (stored) {
    // Apply migrations to loaded data
    const migrated = applyMigrations(stored);
    // Validate and normalize
    const validated = validatePagesMap(migrated);
    if (validated) {
      savePagesToStorage(validated);
      return validated;
    }
  }

  // Return default state with Home page
  return {
    [HOME_PAGE_TITLE]: {
      title: HOME_PAGE_TITLE,
      content: DEFAULT_HOME_CONTENT
    }
  };
}

/**
 * Initialize backup history store
 */
function initializeBackupHistory(): WikiBackupHistory {
  return loadBackupHistoryFromStorage();
}

// Create primary pages store
export const pages = writable<WikiPageMap>(initializePagesStore());

// Create backup history store
export const backupHistory = writable<WikiBackupHistory>(initializeBackupHistory());

/**
 * Derived store for easily checking if changes exist
 */
export const hasUnsavedChanges = derived(
  [pages],
  ([$pages]) => {
    const stored = loadPagesFromStorage();
    return JSON.stringify($pages) !== JSON.stringify(stored);
  }
);

/**
 * Subscribe to pages changes and persist to storage
 */
pages.subscribe((value) => {
  savePagesToStorage(value);

  // Also create automatic backup on every change
  backupHistory.update((history) => {
    const backup = createBackupEntry(value);
    return addBackupToHistory(history, backup);
  });

  // Persist backup history
  backupHistory.subscribe((backup) => {
    saveBackupHistoryToStorage(backup);
  });
});

/**
 * Get all backups
 */
export function getBackups(): WikiBackupHistory {
  const store = backupHistory;
  let backups: WikiBackupHistory = [];
  store.subscribe((value) => {
    backups = value;
  })();
  return backups;
}

/**
 * Restore a backup by timestamp
 */
export function restoreBackup(timestamp: number): boolean {
  const backups = getBackups();
  const backup = backups.find((b) => b.timestamp === timestamp);
  
  if (backup) {
    pages.set(backup.data);
    return true;
  }
  
  return false;
}

/**
 * Export pages as JSON string
 */
export function exportData(): string {
  let current: WikiPageMap = {};
  pages.subscribe((value) => {
    current = value;
  })();

  // Ensure Home page exists in export
  const exported = { ...current };
  if (!exported[HOME_PAGE_TITLE]) {
    exported[HOME_PAGE_TITLE] = {
      title: HOME_PAGE_TITLE,
      content: DEFAULT_HOME_CONTENT
    };
  }

  return exportDataAsJson(exported);
}

/**
 * Import pages from JSON string
 */
export function importData(jsonString: string): boolean {
  const parsed = parseImportedJson(jsonString);
  
  if (parsed) {
    const validated = validatePagesMap(parsed);
    if (validated) {
      pages.set(validated);
      return true;
    }
  }

  return false;
}
/**
 * Storage abstraction layer for wiki data persistence
 */

import { browser } from '$app/environment';
import type { WikiPageMap, WikiBackup, WikiBackupHistory } from '$lib/types';
import {
  STORAGE_KEY_PAGES,
  STORAGE_KEY_BACKUPS,
  STORAGE_KEY_SIDEBAR_WIDTH,
  STORAGE_KEY_EXPANDED_NODES,
  MAX_BACKUPS
} from '$lib/constants';

/**
 * Load pages from localStorage
 */
export function loadPagesFromStorage(): WikiPageMap | null {
  if (!browser) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY_PAGES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load pages from storage:', error);
    return null;
  }
}

/**
 * Save pages to localStorage
 */
export function savePagesToStorage(pages: WikiPageMap): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
  } catch (error) {
    console.error('Failed to save pages to storage:', error);
  }
}

/**
 * Load backup history from localStorage
 */
export function loadBackupHistoryFromStorage(): WikiBackupHistory {
  if (!browser) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY_BACKUPS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load backup history from storage:', error);
    return [];
  }
}

/**
 * Save backup history to localStorage
 */
export function saveBackupHistoryToStorage(backups: WikiBackupHistory): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(backups));
  } catch (error) {
    console.error('Failed to save backup history to storage:', error);
  }
}

/**
 * Create a new backup entry
 */
export function createBackupEntry(data: WikiPageMap): WikiBackup {
  return {
    timestamp: Date.now(),
    data
  };
}

/**
 * Add a backup to history, maintaining max backup limit
 */
export function addBackupToHistory(
  history: WikiBackupHistory,
  backup: WikiBackup
): WikiBackupHistory {
  const updated = [...history, backup];
  
  // Remove oldest backups if exceeding limit
  if (updated.length > MAX_BACKUPS) {
    return updated.slice(updated.length - MAX_BACKUPS);
  }
  
  return updated;
}

/**
 * Load sidebar width from storage
 */
export function loadSidebarWidthFromStorage(): number | null {
  if (!browser) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY_SIDEBAR_WIDTH);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load sidebar width from storage:', error);
    return null;
  }
}

/**
 * Save sidebar width to storage
 */
export function saveSidebarWidthToStorage(width: number): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY_SIDEBAR_WIDTH, JSON.stringify(width));
  } catch (error) {
    console.error('Failed to save sidebar width to storage:', error);
  }
}

/**
 * Load expanded nodes from storage
 */
export function loadExpandedNodesFromStorage(): Set<string> {
  if (!browser) return new Set();
  try {
    const data = localStorage.getItem(STORAGE_KEY_EXPANDED_NODES);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (error) {
    console.error('Failed to load expanded nodes from storage:', error);
    return new Set();
  }
}

/**
 * Save expanded nodes to storage
 */
export function saveExpandedNodesToStorage(nodes: Set<string>): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY_EXPANDED_NODES, JSON.stringify(Array.from(nodes)));
  } catch (error) {
    console.error('Failed to save expanded nodes to storage:', error);
  }
}

/**
 * Clear all storage
 */
export function clearAllStorage(): void {
  if (!browser) return;
  try {
    localStorage.removeItem(STORAGE_KEY_PAGES);
    localStorage.removeItem(STORAGE_KEY_BACKUPS);
    localStorage.removeItem(STORAGE_KEY_SIDEBAR_WIDTH);
    localStorage.removeItem(STORAGE_KEY_EXPANDED_NODES);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Export data as JSON string
 */
export function exportDataAsJson(pages: WikiPageMap): string {
  try {
    return JSON.stringify(pages, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    return '{}';
  }
}

/**
 * Parse imported JSON data
 */
export function parseImportedJson(jsonString: string): WikiPageMap | null {
  try {
    const data = JSON.parse(jsonString);
    if (typeof data !== 'object' || data === null) {
      return null;
    }
    return data as WikiPageMap;
  } catch (error) {
    console.error('Failed to parse imported JSON:', error);
    return null;
  }
}

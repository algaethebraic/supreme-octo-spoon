import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type WikiPage = {
  title: string;
  content: string;
};

const BACKUP_KEY = 'wiki-pages-backups';
const MAX_BACKUPS = 20;

function createBackup(data: Record<string, WikiPage>) {
  if (!browser) return;
  
  const backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
  backups.push({
    timestamp: Date.now(),
    data
  });
  
  // Keep only the last MAX_BACKUPS backups
  if (backups.length > MAX_BACKUPS) {
    backups.shift();
  }
  
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
}

export function getBackups() {
  if (!browser) return [];
  return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
}

export function restoreBackup(timestamp: number) {
  if (!browser) return;
  const backups = getBackups();
  const backup = backups.find((b: any) => b.timestamp === timestamp);
  if (backup) {
    pages.set(backup.data);
  }
}

export function exportData() {
  if (!browser) return '';
  const data = localStorage.getItem('wiki-pages');
  if (!data) return '{}';
  
  // Ensure export is valid JSON
  try {
    const parsed = JSON.parse(data) as Record<string, WikiPage>;
    // Ensure Home page exists in export
    if (!parsed['Home']) {
      parsed['Home'] = { title: 'Home', content: 'Welcome! Try adding links like [Documentation] or [Projects]' };
    }
    return JSON.stringify(parsed);
  } catch (e) {
    console.error('Error exporting data:', e);
    return '{}';
  }
}

export function importData(jsonString: string) {
  try {
    const data = JSON.parse(jsonString);
    if (typeof data === 'object' && data !== null) {
      // Validate and ensure all pages have required fields
      const validatedData: Record<string, WikiPage> = {};
      for (const [key, page] of Object.entries(data)) {
        if (typeof page === 'object' && page !== null) {
          const p = page as any;
          // Ensure page has title and content, use defaults if missing
          validatedData[key] = {
            title: p.title || key || 'Untitled',
            content: p.content || ''
          };
        }
      }
      pages.set(validatedData);
      return true;
    }
  } catch (e) {
    console.error('Failed to import data:', e);
  }
  return false;
}

function migratePages(pages: Record<string, WikiPage>): Record<string, WikiPage> {
  const migrated: Record<string, WikiPage> = {};
  for (const [key, page] of Object.entries(pages)) {
    migrated[key] = {
      ...page,
      content: page.content.replace(/\[\[([^\]]+)\]\]/g, '[$1]')
    };
  }
  return migrated;
}

const stored = browser ? localStorage.getItem('wiki-pages') : null;

let initialPages: Record<string, WikiPage>;
if (stored) {
  const parsed = JSON.parse(stored);
  initialPages = migratePages(parsed);
  // Update localStorage with migrated data
  if (browser) {
    localStorage.setItem('wiki-pages', JSON.stringify(initialPages));
  }
} else {
  initialPages = {
    'Home': { title: 'Home', content: 'Welcome! Try adding links like [Documentation] or [Projects]' },
  };
}

export const pages = writable<Record<string, WikiPage>>(initialPages);

pages.subscribe((value) => {
  if (browser) {
    localStorage.setItem('wiki-pages', JSON.stringify(value));
    createBackup(value);
  }
});
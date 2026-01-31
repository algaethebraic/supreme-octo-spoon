/**
 * Data migration utilities for handling schema changes
 */

import type { WikiPageMap } from '$lib/types';

/**
 * Migrate pages from old link syntax ([[text]]) to new syntax ([text])
 */
export function migrateFromOldLinkSyntax(pages: WikiPageMap): WikiPageMap {
  const migrated: WikiPageMap = {};
  
  for (const [key, page] of Object.entries(pages)) {
    migrated[key] = {
      ...page,
      content: page.content.replace(/\[\[([^\]]+)\]\]/g, '[$1]')
    };
  }
  
  return migrated;
}

/**
 * Validate and normalize page data
 */
export function normalizePageData(page: any): { title: string; content: string } | null {
  if (typeof page !== 'object' || page === null) {
    return null;
  }

  const title = typeof page.title === 'string' ? page.title.trim() : null;
  const content = typeof page.content === 'string' ? page.content : '';

  if (!title) {
    return null;
  }

  return { title, content };
}

/**
 * Validate entire pages map
 */
export function validatePagesMap(data: any): WikiPageMap | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const validated: WikiPageMap = {};

  for (const [key, page] of Object.entries(data)) {
    const normalized = normalizePageData(page);
    if (normalized) {
      validated[key] = normalized;
    }
  }

  return validated;
}

/**
 * Apply all necessary migrations to loaded data
 */
export function applyMigrations(pages: WikiPageMap): WikiPageMap {
  // Apply old syntax migration
  let migrated = migrateFromOldLinkSyntax(pages);
  
  // Add more migrations here as needed in future versions
  
  return migrated;
}

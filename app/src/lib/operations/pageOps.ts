/**
 * Page management operations
 * Higher-level operations for loading, saving, and deleting wiki pages
 */

import { pages } from '$lib/stores/pages';
import { get } from 'svelte/store';
import type { WikiPageMap } from '$lib/types';
import { 
  getSourceLinkedPages as getSourceLinkedPagesFromAnalysis,
  getOrphanedPages 
} from '$lib/analysis/linkAnalysis';
import { HOME_PAGE_TITLE } from '$lib/constants';

/**
 * Load a wiki page by title
 * Creates the page if it doesn't exist
 * 
 * @param title - Page title
 * @param setCurrentTitle - Callback to update current title
 * @param setContent - Callback to update content
 * @param addToHistory - Callback to add to navigation history
 */
export function loadPage(
  title: string,
  setCurrentTitle: (title: string) => void,
  setContent: (content: string) => void,
  addToHistory: (title: string) => void
): void {
  const currentPages = get(pages);
  const currentPage = currentPages[title];

  if (!currentPage) {
    // Create new page if it doesn't exist
    pages.update((p) => ({
      ...p,
      [title]: { title, content: '' }
    }));
    setContent('');
  } else {
    setContent(currentPage.content);
  }

  setCurrentTitle(title);
  addToHistory(title);
}

/**
 * Save page content to store
 * 
 * @param title - Page title
 * @param content - Page content
 */
export function savePage(title: string, content: string): void {
  pages.update((p) => ({
    ...p,
    [title]: { title, content }
  }));
}

/**
 * Delete a page from the store
 * 
 * @param title - Page title to delete
 */
export function deletePage(title: string): void {
  pages.update((p) => {
    const updated = { ...p };
    delete updated[title];
    return updated;
  });
}

/**
 * Check if a page exists
 * 
 * @param title - Page title
 * @returns True if page exists
 */
export function pageExists(title: string): boolean {
  return title in get(pages);
}

/**
 * Get all page titles
 * 
 * @returns Array of all page titles
 */
export function getPageTitles(): string[] {
  return Object.keys(get(pages));
}

/**
 * Get all pages that are explicitly linked to
 * 
 * @param allPages - Map of all pages
 * @returns Set of page titles that have source links
 */
export function getSourceLinkedPages(allPages: WikiPageMap): Set<string> {
  return getSourceLinkedPagesFromAnalysis(allPages);
}

/**
 * Get orphan pages (pages not linked from any other page)
 * 
 * @param allPages - Map of all pages
 * @returns Array of orphan page titles
 */
export function getOrphanPages(allPages: WikiPageMap): string[] {
  return getOrphanedPages(allPages);
}

/**
 * Rename a page (create new, delete old)
 * 
 * @param oldTitle - Current page title
 * @param newTitle - New page title
 * @returns True if rename was successful
 */
export function renamePage(oldTitle: string, newTitle: string): boolean {
  if (oldTitle === newTitle || !pageExists(oldTitle) || pageExists(newTitle)) {
    return false;
  }

  const currentPages = get(pages);
  const oldPage = currentPages[oldTitle];
  
  if (!oldPage) {
    return false;
  }

  pages.update((p) => {
    const updated = { ...p };
    updated[newTitle] = { ...oldPage, title: newTitle };
    delete updated[oldTitle];
    return updated;
  });

  return true;
}

/**
 * Get page statistics
 */
export function getPageStats(allPages: WikiPageMap): {
  totalPages: number;
  sourceLinkedPages: number;
  orphanPages: number;
  homePageExists: boolean;
} {
  const sourceLinked = getSourceLinkedPages(allPages);
  const orphans = getOrphanedPages(allPages);

  return {
    totalPages: Object.keys(allPages).length,
    sourceLinkedPages: sourceLinked.size,
    orphanPages: orphans.length,
    homePageExists: HOME_PAGE_TITLE in allPages
  };
}

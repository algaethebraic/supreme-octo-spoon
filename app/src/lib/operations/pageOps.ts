import { pages } from '$lib/stores/pages';
import { get } from 'svelte/store';
import type { WikiPage } from '$lib/stores/pages';

/**
 * Load a wiki page by title
 * Creates the page if it doesn't exist
 */
export function loadPage(
  title: string,
  setCurrentTitle: (title: string) => void,
  setContent: (content: string) => void,
  addToHistory: (title: string) => void
) {
  const currentPages = get(pages);
  const currentPage = currentPages[title];

  if (!currentPage) {
    // Create new page
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
 * Save current page content to store
 */
export function savePage(title: string, content: string) {
  pages.update((p) => ({
    ...p,
    [title]: { title, content }
  }));
}

/**
 * Delete a page
 */
export function deletePage(title: string) {
  pages.update((p) => {
    const updated = { ...p };
    delete updated[title];
    return updated;
  });
}

/**
 * Check if a page exists
 */
export function pageExists(title: string): boolean {
  return title in get(pages);
}

/**
 * Get all page titles
 */
export function getPageTitles(): string[] {
  return Object.keys(get(pages));
}

/**
 * Get all pages that reference a given page
 */
export function getSourceLinkedPages(allPages: Record<string, WikiPage>): Set<string> {
  const sourceLinks = new Set<string>();
  const linkRegex = /\[([^\]]+)\]/g;

  for (const page of Object.values(allPages)) {
    const matches = page.content.matchAll(linkRegex);
    for (const match of matches) {
      sourceLinks.add(match[1].trim());
    }
  }

  return sourceLinks;
}

/**
 * Get orphan pages (pages that aren't linked to from other pages)
 */
export function getOrphanPages(allPages: Record<string, WikiPage>): string[] {
  const sourceLinkedPages = getSourceLinkedPages(allPages);
  return Object.keys(allPages).filter(p => !sourceLinkedPages.has(p) && p !== 'Home');
}

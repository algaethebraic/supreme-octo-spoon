/**
 * Wiki link analysis and extraction utilities
 * Handles parsing, extracting, and categorizing wiki links
 */

import type { WikiPageMap, LinkExtraction } from '$lib/types';
import { WIKI_LINK_PATTERN, REGEX_SPECIAL_CHARS } from '$lib/constants';

/**
 * Extract source links from page content
 * Source links are explicit [text] format links
 */
export function extractSourceLinks(content: string): Set<string> {
  const links = new Set<string>();
  let match;
  
  // Create a fresh regex instance for each call
  const pattern = new RegExp(WIKI_LINK_PATTERN);
  
  while ((match = pattern.exec(content)) !== null) {
    const link = match[1].trim();
    if (link) {
      links.add(link);
    }
  }
  
  return links;
}

/**
 * Extract proxy links from page content
 * Proxy links are page names mentioned outside brackets
 */
export function extractProxyLinks(
  content: string,
  pageNames: Set<string>
): Set<string> {
  const links = new Set<string>();
  
  // Remove all bracketed content to avoid counting explicit links
  const contentWithoutBrackets = content.replace(/\[[^\]]*\]/g, '');
  
  pageNames.forEach((pageName) => {
    if (!pageName) return;
    
    // Escape special regex characters
    const escapedName = pageName.replace(REGEX_SPECIAL_CHARS, '\\$&');
    // Match whole word only
    const regex = new RegExp(`\\b${escapedName}\\b`, 'i');
    
    if (regex.test(contentWithoutBrackets)) {
      links.add(pageName);
    }
  });
  
  return links;
}

/**
 * Extract all links (both source and proxy) from a page
 */
export function extractAllLinksFromPage(
  content: string,
  pageNames: Set<string>
): LinkExtraction {
  const sourceLinks = extractSourceLinks(content);
  const proxyLinks = extractProxyLinks(content, pageNames);
  
  // Combine for total links (source takes precedence if duplicate)
  const allLinks = new Set([...sourceLinks, ...proxyLinks]);
  
  return { sourceLinks, proxyLinks, allLinks };
}

/**
 * Get all links referenced in a specific page
 */
export function getPageLinks(
  pageName: string,
  pages: WikiPageMap
): LinkExtraction {
  const page = pages[pageName];
  if (!page) {
    return {
      sourceLinks: new Set(),
      proxyLinks: new Set(),
      allLinks: new Set()
    };
  }

  const pageNames = new Set(Object.keys(pages));
  pageNames.delete(pageName); // Don't link to self

  return extractAllLinksFromPage(page.content, pageNames);
}

/**
 * Get all source-linked pages (pages with explicit links)
 */
export function getSourceLinkedPages(pages: WikiPageMap): Set<string> {
  const sourceLinks = new Set<string>();

  for (const page of Object.values(pages)) {
    const links = extractSourceLinks(page.content);
    links.forEach((link) => sourceLinks.add(link));
  }

  return sourceLinks;
}

/**
 * Get pages that link to a specific page
 */
export function getPageReferences(
  targetPage: string,
  pages: WikiPageMap
): Set<string> {
  const references = new Set<string>();

  for (const [pageName, page] of Object.entries(pages)) {
    if (pageName === targetPage) continue;

    const pageNames = new Set(Object.keys(pages));
    pageNames.delete(pageName);

    const links = extractAllLinksFromPage(page.content, pageNames);
    if (links.allLinks.has(targetPage)) {
      references.add(pageName);
    }
  }

  return references;
}

/**
 * Get orphaned pages (pages not linked from anywhere)
 */
export function getOrphanedPages(pages: WikiPageMap): string[] {
  const sourceLinkedPages = getSourceLinkedPages(pages);
  const orphans: string[] = [];

  for (const pageName of Object.keys(pages)) {
    // Home is never orphaned, and pages that are explicitly linked to are not orphans
    if (pageName !== 'Home' && !sourceLinkedPages.has(pageName)) {
      orphans.push(pageName);
    }
  }

  return orphans;
}

/**
 * Check if adding/removing a link would create circular dependencies
 */
export function wouldCreateCircularDependency(
  sourcePage: string,
  targetPage: string,
  pages: WikiPageMap
): boolean {
  if (sourcePage === targetPage) {
    return true;
  }

  // Simple check: if target page links to source page, it would be circular
  const targetPageData = pages[targetPage];
  if (!targetPageData) {
    return false;
  }

  const targetLinks = extractSourceLinks(targetPageData.content);
  return targetLinks.has(sourcePage);
}

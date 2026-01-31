/**
 * Wiki content rendering utilities
 * Handles converting wiki markup to HTML with proper link styling
 */

import type { WikiPageMap } from '$lib/types';
import { extractSourceLinks, extractProxyLinks } from '$lib/analysis/linkAnalysis';
import { WIKI_LINK_PATTERN, REGEX_SPECIAL_CHARS } from '$lib/constants';

/**
 * Parse wiki links in text and apply transformation function
 * 
 * @param text - Text containing wiki links in [title] format
 * @param onLink - Callback function to transform link text
 * @returns Transformed text with callback applied to each link
 */
export function parseWikiLinks(
  text: string,
  onLink: (title: string) => string
): string {
  return text.replace(WIKI_LINK_PATTERN, (_, title) => {
    return onLink(title.trim());
  });
}

/**
 * Render page content with HTML links
 * Handles both source links ([text]) and proxy links (bare page names)
 * 
 * @param text - Page content text
 * @param pages - Map of all wiki pages
 * @returns HTML string with rendered links
 */
export function renderContent(
  text: string,
  pages: WikiPageMap
): string {
  // First, handle explicit source links
  let result = parseWikiLinks(text, (title) => {
    const trimmedTitle = title.trim();
    return `<a href="#" data-link="${trimmedTitle}" class="source-link">${trimmedTitle}</a>`;
  });

  // Then, handle proxy links (page names outside brackets)
  const allPageNames = new Set(Object.keys(pages));
  const proxyLinks = extractProxyLinks(text, allPageNames);

  proxyLinks.forEach((pageName) => {
    if (!pageName) return;

    // Escape special regex characters in page name
    const escapedPageName = pageName.replace(REGEX_SPECIAL_CHARS, '\\$&');
    
    // Match page name as whole word, but not inside existing links or brackets
    // Negative lookbehind/lookahead to avoid matching inside tags
    const regex = new RegExp(
      `(?<!\\[)(?<![>\\w])\\b${escapedPageName}\\b(?!\\])(?![^<]*</)`,
      'gi'
    );

    result = result.replace(
      regex,
      `<a href="#" data-link="${pageName}" class="proxy-link">${pageName}</a>`
    );
  });

  return result;
}

/**
 * Extract all source-linked page names from all pages
 * @deprecated Use getSourceLinkedPages from linkAnalysis instead
 */
export function getSourceLinkedPages(pages: WikiPageMap): Set<string> {
  const sourceLinks = new Set<string>();
  
  Object.values(pages).forEach((page) => {
    const links = extractSourceLinks(page.content);
    links.forEach((link) => sourceLinks.add(link));
  });
  
  return sourceLinks;
}

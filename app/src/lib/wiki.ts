import type { WikiPage } from './stores/pages';

export function parseWikiLinks(
  text: string,
  onLink: (title: string) => string
) {
  return text.replace(/\[([^\]]+)\]/g, (_, title) => {
    return onLink(title.trim());
  });
}

export function getSourceLinkedPages(pages: Record<string, WikiPage>): Set<string> {
  const sourceLinks = new Set<string>();
  
  Object.values(pages).forEach((page) => {
    const linkRegex = /\[([^\]]+)\]/g;
    let match;
    while ((match = linkRegex.exec(page.content)) !== null) {
      sourceLinks.add(match[1].trim());
    }
  });
  
  return sourceLinks;
}

export function renderContent(text: string, pages: Record<string, WikiPage>): string {
  const sourceLinkedPages = getSourceLinkedPages(pages);
  
  // First, handle source links (explicit [...] format)
  let result = parseWikiLinks(text, (title) => {
    const trimmedTitle = title.trim();
    return `<a href="#" data-link="${trimmedTitle}" class="source-link">${trimmedTitle}</a>`;
  });
  
  // Then, handle proxy links (page names without brackets that have source links)
  sourceLinkedPages.forEach((pageName) => {
    if (!pageName) return;
    
    // Find words that match page names but aren't already in links
    const escapedPageName = pageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the page name but only if it's not inside an <a> tag or [...]
    const regex = new RegExp(`(?<!\\[)(?<![>\\w])\\b${escapedPageName}\\b(?!\\])(?![^<]*</)`, 'gi');
    
    result = result.replace(regex, `<a href="#" data-link="${pageName}" class="proxy-link">${pageName}</a>`);
  });
  
  return result;
}

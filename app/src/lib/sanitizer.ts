import type { WikiPage } from './stores/pages';

export type ConflictItem = {
  pageName: string;
  sources: string[];
};

export function findConflicts(pages: Record<string, WikiPage>): ConflictItem[] {
  const sourceMap: Record<string, string[]> = {};
  
  // Find all source links and track which pages have them
  Object.entries(pages).forEach(([pageName, page]) => {
    const linkRegex = /\[([^\]]+)\]/g;
    let match;
    
    while ((match = linkRegex.exec(page.content)) !== null) {
      const linkedPageName = match[1].trim();
      if (!sourceMap[linkedPageName]) {
        sourceMap[linkedPageName] = [];
      }
      sourceMap[linkedPageName].push(pageName);
    }
  });
  
  // Return only pages with multiple sources
  return Object.entries(sourceMap)
    .filter(([, sources]) => sources.length > 1)
    .map(([pageName, sources]) => ({ pageName, sources: Array.from(new Set(sources)) }));
}

export function applyConflictResolutions(
  pages: Record<string, WikiPage>,
  conflicts: ConflictItem[],
  resolutions: Record<string, string>
): Record<string, WikiPage> {
  const allPages = { ...pages };
  
  // For each conflict, remove [...] from non-chosen sources
  Object.entries(resolutions).forEach(([pageName, chosenSource]) => {
    const conflict = conflicts.find(c => c.pageName === pageName);
    if (!conflict) return;
    
    // Update each source page
    conflict.sources.forEach((sourcePage) => {
      if (sourcePage !== chosenSource) {
        // Remove [...] from this source page
        allPages[sourcePage] = {
          ...allPages[sourcePage],
          content: allPages[sourcePage].content.replace(
            new RegExp(`\\[${pageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g'),
            pageName
          )
        };
      }
    });
  });
  
  return allPages;
}

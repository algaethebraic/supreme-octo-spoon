import type { WikiPage } from './stores/pages';

export type TreeNode = {
  name: string;
  path: string;
  isPage: boolean;
  children: Map<string, TreeNode>;
  hasLinks: boolean;
};

export function getAllWikiLinks(pageName: string, pages: Record<string, WikiPage>): Set<string> {
  const allLinks = new Set<string>();
  
  // Get source links (explicit [text] links on this page)
  const page = pages[pageName];
  if (page) {
    const linkRegex = /\[([^\]]+)\]/g;
    let match;
    while ((match = linkRegex.exec(page.content)) !== null) {
      const trimmedLink = match[1].trim();
      if (trimmedLink) {
        allLinks.add(trimmedLink);
      }
    }
  }
  
  // Get proxy links - page names mentioned outside of brackets
  if (page?.content) {
    // Remove all bracketed content to check for mentions outside brackets
    const contentWithoutBrackets = page.content.replace(/\[[^\]]*\]/g, '');
    
    Object.keys(pages).forEach((otherPageName) => {
      if (otherPageName !== pageName) {
        // Check if page name appears as a whole word (with word boundaries)
        const escapedName = otherPageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
        if (regex.test(contentWithoutBrackets)) {
          allLinks.add(otherPageName);
        }
      }
    });
  }
  
  return allLinks;
}

export function buildPageTree(pages: Record<string, WikiPage>): TreeNode {
  // Add links from Home (both source and proxy links)
  const allLinksFromHome = getAllWikiLinks('Home', pages);
  
  const root: TreeNode = {
    name: 'Home',
    path: 'Home',
    isPage: false,
    children: new Map(),
    hasLinks: allLinksFromHome.size > 0
  };
  
  allLinksFromHome.forEach((linkTitle) => {
    if (!root.children.has(linkTitle)) {
      const node: TreeNode = {
        name: linkTitle,
        path: 'Home/' + linkTitle,
        isPage: !!pages[linkTitle],
        children: new Map(),
        hasLinks: getAllWikiLinks(linkTitle, pages).size > 0
      };
      root.children.set(linkTitle, node);
    }
  });

  return root;
}

export function populateNodeChildren(node: TreeNode, pageName: string, pages: Record<string, WikiPage>) {
  // Lazy-load children when a node is expanded
  if (node.children.size > 0) return; // Already populated
  
  const allLinks = getAllWikiLinks(pageName, pages);
  
  allLinks.forEach((linkTitle) => {
    if (linkTitle !== 'Home' && !node.children.has(linkTitle)) {
      const childNode: TreeNode = {
        name: linkTitle,
        path: node.path + '/' + linkTitle,
        isPage: !!pages[linkTitle],
        children: new Map(),
        hasLinks: getAllWikiLinks(linkTitle, pages).size > 0
      };
      node.children.set(linkTitle, childNode);
    }
  });
}

export function collectAllNodePaths(node: TreeNode): Set<string> {
  const paths = new Set<string>();
  
  const collect = (n: TreeNode) => {
    paths.add(n.path);
    for (const child of n.children.values()) {
      collect(child);
    }
  };
  
  collect(node);
  return paths;
}

/**
 * Wiki page tree structure and building utilities
 * Creates hierarchical navigation tree from wiki pages and their links
 */

import type { WikiPageMap, TreeNode } from '$lib/types';
import { getPageLinks } from '$lib/analysis/linkAnalysis';
import { HOME_PAGE_TITLE } from '$lib/constants';

// Re-export TreeNode type for convenience
export type { TreeNode } from '$lib/types';

/**
 * Get all wiki links for a page (both source and proxy)
 */
export function getAllWikiLinks(
  pageName: string,
  pages: WikiPageMap
): Set<string> {
  const linkData = getPageLinks(pageName, pages);
  return linkData.allLinks;
}

/**
 * Build the root tree node from Home page
 */
export function buildPageTree(pages: WikiPageMap): TreeNode {
  const allLinksFromHome = getAllWikiLinks(HOME_PAGE_TITLE, pages);

  const root: TreeNode = {
    name: HOME_PAGE_TITLE,
    path: HOME_PAGE_TITLE,
    isPage: false,
    children: new Map(),
    hasLinks: allLinksFromHome.size > 0
  };

  allLinksFromHome.forEach((linkTitle) => {
    if (!root.children.has(linkTitle)) {
      const node: TreeNode = {
        name: linkTitle,
        path: `${HOME_PAGE_TITLE}/${linkTitle}`,
        isPage: !!pages[linkTitle],
        children: new Map(),
        hasLinks: getAllWikiLinks(linkTitle, pages).size > 0
      };
      root.children.set(linkTitle, node);
    }
  });

  return root;
}

/**
 * Populate a node's children when it's expanded
 * Uses lazy loading to avoid building entire tree upfront
 */
export function populateNodeChildren(
  node: TreeNode,
  pageName: string,
  pages: WikiPageMap
): void {
  // Skip if already populated
  if (node.children.size > 0) {
    return;
  }

  const allLinks = getAllWikiLinks(pageName, pages);

  allLinks.forEach((linkTitle) => {
    if (linkTitle !== HOME_PAGE_TITLE && !node.children.has(linkTitle)) {
      const childNode: TreeNode = {
        name: linkTitle,
        path: `${node.path}/${linkTitle}`,
        isPage: !!pages[linkTitle],
        children: new Map(),
        hasLinks: getAllWikiLinks(linkTitle, pages).size > 0
      };
      node.children.set(linkTitle, childNode);
    }
  });
}

/**
 * Recursively collect all node paths in the tree
 */
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

/**
 * Find a node in the tree by path
 */
export function findNodeByPath(
  root: TreeNode,
  targetPath: string
): TreeNode | null {
  if (root.path === targetPath) {
    return root;
  }

  for (const child of root.children.values()) {
    const found = findNodeByPath(child, targetPath);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Get the depth of a node in the tree
 */
export function getNodeDepth(node: TreeNode): number {
  return node.path.split('/').length - 1;
}

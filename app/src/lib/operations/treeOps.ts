import { writable } from 'svelte/store';
import type { TreeNode } from '$lib/tree';

/**
 * Create a tree node toggle store
 */
export function createTreeToggleStore() {
  const { subscribe, update } = writable(new Set<string>());

  return {
    subscribe,
    toggle: (path: string) => {
      update(set => {
        const newSet = new Set(set);
        if (newSet.has(path)) {
          newSet.delete(path);
        } else {
          newSet.add(path);
        }
        return newSet;
      });
    },
    expand: (path: string) => {
      update(set => {
        const newSet = new Set(set);
        newSet.add(path);
        return newSet;
      });
    },
    collapse: (path: string) => {
      update(set => {
        const newSet = new Set(set);
        newSet.delete(path);
        return newSet;
      });
    },
    clear: () => {
      update(() => new Set<string>());
    }
  };
}

/**
 * Save expanded nodes to localStorage
 */
export function saveExpandedNodesToStorage(nodes: Set<string>) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('expandedNodes', JSON.stringify(Array.from(nodes)));
  }
}

/**
 * Load expanded nodes from localStorage
 */
export function loadExpandedNodesFromStorage(): Set<string> {
  if (typeof localStorage === 'undefined') {
    return new Set(['Home']);
  }

  try {
    const saved = localStorage.getItem('expandedNodes');
    return saved ? new Set(JSON.parse(saved)) : new Set(['Home']);
  } catch {
    return new Set(['Home']);
  }
}

/**
 * Save sidebar width to localStorage
 */
export function saveSidebarWidth(width: number) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('sidebarWidth', String(width));
  }
}

/**
 * Load sidebar width from localStorage
 */
export function loadSidebarWidth(): number {
  if (typeof localStorage === 'undefined') {
    return 220;
  }

  try {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 220;
  } catch {
    return 220;
  }
}

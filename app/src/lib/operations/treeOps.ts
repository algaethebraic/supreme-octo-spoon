/**
 * Tree navigation and sidebar operations
 */

import { writable } from 'svelte/store';
import {
  loadExpandedNodesFromStorage as loadFromStorage,
  saveExpandedNodesToStorage as saveToStorage,
  loadSidebarWidthFromStorage as loadSidebarFromStorage,
  saveSidebarWidthToStorage as saveSidebarToStorage
} from '$lib/storage/persistence';
import { HOME_PAGE_TITLE, DEFAULT_SIDEBAR_WIDTH } from '$lib/constants';

/**
 * Create a tree node toggle store with expand/collapse operations
 */
export function createTreeToggleStore() {
  const { subscribe, update } = writable(new Set<string>());

  return {
    subscribe,
    toggle: (path: string) => {
      update((set) => {
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
      update((set) => {
        const newSet = new Set(set);
        newSet.add(path);
        return newSet;
      });
    },
    collapse: (path: string) => {
      update((set) => {
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
export function saveExpandedNodesToStorage(nodes: Set<string>): void {
  saveToStorage(nodes);
}

/**
 * Load expanded nodes from localStorage
 */
export function loadExpandedNodesFromStorage(): Set<string> {
  const loaded = loadFromStorage();
  return loaded.size > 0 ? loaded : new Set([HOME_PAGE_TITLE]);
}

/**
 * Save sidebar width to localStorage
 */
export function saveSidebarWidth(width: number): void {
  saveSidebarToStorage(width);
}

/**
 * Load sidebar width from localStorage
 */
export function loadSidebarWidth(): number {
  const loaded = loadSidebarFromStorage();
  return loaded ?? DEFAULT_SIDEBAR_WIDTH;
}

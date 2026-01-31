import { writable } from 'svelte/store';
import type { ConflictItem } from '$lib/sanitizer';
import type { ColorScheme } from '$lib/stores/themes';
import { DEFAULT_DARK_COLORS } from '$lib/stores/themes';
import { createPageHistory } from '$lib/navigation';

// Page editor state
export const currentTitle = writable('Home');
export const content = writable('');

// Navigation history state
export const pageHistory = writable(createPageHistory());
export const canGoBack = writable(false);
export const canGoForward = writable(false);

// UI state
export const showBackups = writable(false);
export const showSettings = writable(false);
export const sidebarWidth = writable(220);
export const isResizing = writable(false);
export const isDarkMode = writable(true);

// Context menu state
export const showContextMenu = writable(false);
export const menuPosition = writable({ x: 0, y: 0 });
export const selectedWord = writable('');
export const menuText = writable('');

// Sanitizer/Conflict state
export const isSanitizing = writable(false);
export const sanitizeConflicts = writable<ConflictItem[]>([]);
export const currentConflictIndex = writable(0);
export const conflictResolutions = writable<Record<string, string>>({});

// Delete confirmation state
export const showDeleteConfirm = writable(false);
export const pageToDelete = writable<string | null>(null);

// Color editing state
export const currentEditingColors = writable<ColorScheme>({ ...DEFAULT_DARK_COLORS });

// Tree state
export const expandedNodesStore = writable(new Set<string>());

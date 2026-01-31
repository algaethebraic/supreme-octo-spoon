<script lang="ts">
  export const ssr = false;
  import { pages, type WikiPage } from '$lib/stores/pages';
  import { theme, type ColorScheme, DEFAULT_DARK_COLORS } from '$lib/stores/themes';
  import { getBackups, restoreBackup, exportData, importData } from '$lib/stores/pages';
  import { buildPageTree, populateNodeChildren, collectAllNodePaths, type TreeNode as TreeNodeType } from '$lib/tree';
  import { renderContent } from '$lib/wiki';
  import { createPageHistory, canGoBack, canGoForward, goBack as navGoBack, goForward as navGoForward, addToHistory } from '$lib/navigation';
  import { findConflicts, applyConflictResolutions, type ConflictItem } from '$lib/sanitizer';
  import { get, derived, writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import TreeNode from '$lib/TreeNode.svelte';
  import ConflictModal from '$lib/components/ConflictModal.svelte';
  import DeleteModal from '$lib/components/DeleteModal.svelte';
  import SettingsModal from '$lib/components/SettingsModal.svelte';
  import ContextMenu from '$lib/components/ContextMenu.svelte';

  // State management
  let currentTitle = 'Home';
  let content = '';
  let backups = getBackups();
  let showBackups = false;
  let importInput: HTMLInputElement;
  let container: HTMLDivElement;
  let sidebarWidth = 220;
  let isResizing = false;
  
  const expandedNodesStore = writable(new Set<string>());
  let pageHistory = createPageHistory();
  
  // Context menu variables
  let showContextMenu = false;
  let menuPosition = { x: 0, y: 0 };
  let selectedWord = '';
  let menuText = '';
  
  // Sanitize mode variables
  let isSanitizing = false;
  let sanitizeConflicts: ConflictItem[] = [];
  let currentConflictIndex = 0;
  let conflictResolutions: Record<string, string> = {};
  
  // Delete confirmation variables
  let showDeleteConfirm = false;
  let pageToDelete: string | null = null;
  
  // Settings modal state
  let showSettings = false;
  let currentEditingColors: ColorScheme = { ...DEFAULT_DARK_COLORS };
  
  // Subscribe to the theme store
  let isDarkMode: boolean;
  
  $: expandedNodes = $expandedNodesStore;

  // ===== Color management functions =====
  
  function applyColors(colors: ColorScheme) {
    theme.applyColors(colors);
  }

  function resetColorsToDefault() {
    theme.resetToDefaults();
    theme.subscribe(state => {
      isDarkMode = state.isDarkMode;
      currentEditingColors = isDarkMode ? { ...state.darkColors } : { ...state.lightColors };
      applyColors(currentEditingColors);
    })();
  }

  // ===== Tree management functions =====

  function toggleNode(path: string) {
    expandedNodesStore.update(set => {
      if (set.has(path)) {
        set.delete(path);
      } else {
        set.add(path);
      }
      return set;
    });
  }

  // Wrapper for populateNodeChildren that provides the pages context
  function populateNodeChildrenWrapper(node: TreeNodeType, pageName: string) {
    populateNodeChildren(node, pageName, $pages);
  }

  const pageTreeStore = derived(pages, $pages => buildPageTree($pages));
  let pageTree: TreeNodeType;
  $: pageTree = $pageTreeStore;

  $: expandedNodesStore.update(set => {
    const existing = collectAllNodePaths(pageTree);
    return new Set([...set].filter(p => existing.has(p)));
  });

  // ===== Sidebar and resizing functions =====

  function startResize(e: MouseEvent) {
    isResizing = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  }

  function resize(e: MouseEvent) {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 100 && newWidth < window.innerWidth - 200) {
        sidebarWidth = newWidth;
        if (browser) localStorage.setItem('sidebarWidth', newWidth.toString());
      }
    }
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }

  // ===== Navigation functions =====

  function goBack() {
    const title = navGoBack(pageHistory);
    if (title) {
      currentTitle = title;
      content = $pages[title]?.content || '';
    }
  }

  function goForward() {
    const title = navGoForward(pageHistory);
    if (title) {
      currentTitle = title;
      content = $pages[title]?.content || '';
    }
  }

  function canNavigateBack() {
    return canGoBack(pageHistory);
  }

  function canNavigateForward() {
    return canGoForward(pageHistory);
  }

  // ===== Page management functions =====

  function savePage() {
    pages.update((p) => {
      return {
        ...p,
        [currentTitle]: {
          title: currentTitle,
          content
        }
      };
    });
  }

  function loadPage(title: string) {
    const currentPage = $pages[title];
    if (!currentPage) {
      // Create new page
      pages.update((p) => {
        return {
          ...p,
          [title]: {
            title,
            content: ''
          }
        };
      });
      content = '';
    } else {
      content = currentPage.content;
    }
    
    currentTitle = title;
    addToHistory(pageHistory, title);
  }

  // ===== Content rendering functions =====

  function renderPageContent(text: string) {
    return renderContent(text, $pages);
  }

  $: renderedContent = renderPageContent(content);

  // ===== Link handling functions =====

  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const link = target.closest('[data-link]');
    if (link) {
      // Prevent loading page if textarea is focused to avoid interrupting typing
      if (document.activeElement?.tagName === 'TEXTAREA') return;
      e.preventDefault();
      loadPage(link.getAttribute('data-link')!);
    }
  }

  // ===== Context menu functions =====

  function handleContextMenu(e: MouseEvent) {
    const textarea = e.target as HTMLTextAreaElement;
    if (textarea.tagName !== 'TEXTAREA') return;

    e.preventDefault();

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    if (start === end) {
      // Select the word under the cursor
      const text = textarea.value;
      let wordStart = start;
      while (wordStart > 0 && /\w/.test(text[wordStart - 1])) wordStart--;
      let wordEnd = start;
      while (wordEnd < text.length && /\w/.test(text[wordEnd])) wordEnd++;
      textarea.setSelectionRange(wordStart, wordEnd);
      start = wordStart;
      end = wordEnd;
    }

    const word = textarea.value.substring(start, end).trim();
    const currentPages = get(pages);
    const isExistingPage = Object.keys(currentPages).some(p => p.toLowerCase() === word.toLowerCase());
    const isAlreadyLinked = content.toLowerCase().includes(`[${word.toLowerCase()}]`);
    if (word && !isAlreadyLinked) {
      selectedWord = word;
      menuText = isExistingPage ? 'Re-wikify orphan' : 'Make wiki page';
      menuPosition = { x: e.clientX, y: e.clientY };
      showContextMenu = true;
    }
  }

  function makeWikiLink() {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea && selectedWord) {
      textarea.setRangeText(`[${selectedWord}]`);
      content = textarea.value;
      savePage();
    }
    showContextMenu = false;
  }

  function hideContextMenu() {
    showContextMenu = false;
  }

  // ===== Import/Export functions =====

  function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wiki-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importData(content)) {
          alert('Data imported successfully!');
          backups = getBackups();
          loadPage(currentTitle);
        } else {
          alert('Failed to import data. Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  }

  function handleRestoreBackup(timestamp: number) {
    if (confirm('Restore to this backup? Current changes will be lost.')) {
      restoreBackup(timestamp);
      backups = getBackups();
      if ($pages[currentTitle]) {
        loadPage(currentTitle);
      } else {
        loadPage('Home');
      }
    }
  }

  // ===== Wiki link helper functions =====

  function getSourceLinkedPages(pages: Record<string, WikiPage>): Set<string> {
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

  // ===== Sanitization functions =====

  function startSanitize() {
    const allPages = get(pages);
    const conflicts = findConflicts(allPages);
    if (conflicts.length === 0) {
      alert('No conflicts found. Your wiki is clean!');
      return;
    }
    
    sanitizeConflicts = conflicts;
    currentConflictIndex = 0;
    conflictResolutions = {};
    isSanitizing = true;
  }

  function goToSource(pageName: string) {
    loadPage(pageName);
  }

  function resolveConflict(chosenSource: string) {
    const conflict = sanitizeConflicts[currentConflictIndex];
    conflictResolutions[conflict.pageName] = chosenSource;
    
    // Move to next conflict or finish
    if (currentConflictIndex < sanitizeConflicts.length - 1) {
      currentConflictIndex++;
    } else {
      applySanitization();
    }
  }

  function applySanitization() {
    const allPages = get(pages);
    const updatedPages = applyConflictResolutions(allPages, sanitizeConflicts, conflictResolutions);
    
    // Update all pages at once
    pages.set(updatedPages);
    
    // Exit sanitize mode
    isSanitizing = false;
    sanitizeConflicts = [];
    currentConflictIndex = 0;
    conflictResolutions = {};
    
    alert('Sanitization complete!');
  }

  function cancelSanitize() {
    isSanitizing = false;
    sanitizeConflicts = [];
    currentConflictIndex = 0;
    conflictResolutions = {};
  }

  // ===== Delete functions =====

  function confirmDelete(pageName: string) {
    pageToDelete = pageName;
    showDeleteConfirm = true;
  }

  function deletePage() {
    if (!pageToDelete) return;
    
    const titleToDelete = pageToDelete;
    pages.update(p => {
      const updated = { ...p };
      delete updated[titleToDelete];
      return updated;
    });
    
    // If we're viewing the deleted page, go to Home
    if (currentTitle === titleToDelete) {
      loadPage('Home');
    }
    
    showDeleteConfirm = false;
    pageToDelete = null;
  }

  function cancelDelete() {
    showDeleteConfirm = false;
    pageToDelete = null;
  }

  // ===== Lifecycle and reactivity =====

  pages.subscribe(() => {
    if (!$pages[currentTitle]) {
      loadPage('Home');
    }
  });

  onMount(() => {
    // Initialize page loading
    loadPage(currentTitle);
    
    if (browser) {
      // Subscribe to theme store
      const unsubscribe = theme.subscribe(state => {
        isDarkMode = state.isDarkMode;
        currentEditingColors = isDarkMode ? { ...state.darkColors } : { ...state.lightColors };
        applyColors(currentEditingColors);
      });

      // Load theme settings
      theme.loadFromStorage();

      // Load expanded nodes
      const saved = localStorage.getItem('expandedNodes');
      if (saved) {
        try {
          expandedNodesStore.set(new Set(JSON.parse(saved)));
        } catch (e) {
          expandedNodesStore.set(new Set(['Home']));
        }
      } else {
        expandedNodesStore.set(new Set(['Home']));
      }

      // Load sidebar width
      const savedWidth = localStorage.getItem('sidebarWidth');
      if (savedWidth) sidebarWidth = parseInt(savedWidth);
      if (container) container.style.setProperty('--sidebar-width', sidebarWidth + 'px');

      // Hide context menu on click outside
      const handleGlobalClick = () => {
        showContextMenu = false;
      };
      document.addEventListener('click', handleGlobalClick);

      return () => {
        unsubscribe();
        document.removeEventListener('click', handleGlobalClick);
      };
    }
  });

  // Persist expanded nodes
  $: if (browser) localStorage.setItem('expandedNodes', JSON.stringify(Array.from($expandedNodesStore)));

  // Calculate orphan pages
  $: sourceLinkedPages = getSourceLinkedPages($pages);
  $: orphans = Object.keys($pages).filter(p => !sourceLinkedPages.has(p) && p !== 'Home');

  // Update sidebar width CSS variable
  $: if (container) container.style.setProperty('--sidebar-width', sidebarWidth + 'px');
</script>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s, color 0.3s;
  }

  :global(:root) {
    --bg-primary: #1a1a1a;
    --bg-secondary: #242424;
    --bg-tertiary: #2d2d2d;
    --bg-hover: #333333;
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    --text-tertiary: #808080;
    --border-color: #404040;
    --accent: #6366f1;
    --accent-hover: #4f46e5;
    --accent-light: #818cf8;
    --danger: #ef4444;
    --danger-hover: #dc2626;
    --success: #10b981;
    --warning: #f59e0b;
    --source-link: #818cf8;
    --proxy-link: #a0a0a0;
  }

  .container {
    --sidebar-width: 260px;
    display: grid;
    grid-template-columns: var(--sidebar-width) 5px 1fr;
    height: 100vh;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  textarea {
    width: 100%;
    height: 200px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 12px;
    font-family: 'Fira Code', 'Monaco', monospace;
    font-size: 13px;
    resize: vertical;
    transition: border-color 0.2s, background-color 0.2s;
  }

  textarea:focus {
    outline: none;
    border-color: var(--accent);
    background-color: var(--bg-tertiary);
  }

  .viewer a {
    color: var(--accent-light);
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s;
  }

  .viewer a:hover {
    color: var(--accent);
  }

  .viewer a.source-link {
    color: var(--source-link);
    font-weight: 600;
    background-color: rgba(99, 102, 241, 0.15);
    padding: 2px 6px;
    border-radius: 4px;
    border-left: 2px solid var(--accent);
    text-decoration: none;
  }

  .viewer a.source-link:hover {
    background-color: rgba(99, 102, 241, 0.25);
    color: var(--source-link);
  }

  .viewer a.proxy-link {
    color: var(--proxy-link);
    text-decoration: dotted underline;
    opacity: 1;
    border-bottom: 1px dotted rgba(99, 102, 241, 0.4);
  }

  .viewer a.proxy-link:hover {
    opacity: 1;
    color: var(--proxy-link);
    border-bottom: 1px solid var(--accent-light);
  }

  .controls {
    display: flex;
    gap: 8px;
    margin: 16px 0;
    flex-wrap: wrap;
    align-items: center;
  }

  button {
    padding: 8px 16px;
    background-color: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
  }

  button:hover:not(:disabled) {
    background-color: var(--accent-hover);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transform: translateY(-1px);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  button:disabled {
    background-color: var(--bg-tertiary);
    color: var(--text-tertiary);
    cursor: not-allowed;
    box-shadow: none;
  }

  .backup-list {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 12px;
    max-height: 250px;
    overflow-y: auto;
    margin-top: 12px;
    background-color: var(--bg-secondary);
  }

  .backup-item {
    padding: 10px;
    background-color: var(--bg-tertiary);
    border-radius: 6px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .backup-item button {
    padding: 4px 12px;
    font-size: 12px;
  }

  input[type="file"] {
    display: none;
  }

  .sidebar {
    overflow-y: auto;
    overflow-x: auto;
    border-right: 1px solid var(--border-color);
    padding: 16px;
    background-color: var(--bg-secondary);
  }

  .sidebar h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--sidebar-title);
    border-bottom: 2px solid var(--accent);
    padding-bottom: 8px;
  }

  .sidebar h4 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #fbbf24;
  }

  .resizer {
    width: 5px;
    cursor: col-resize;
    background: var(--border-color);
    transition: background-color 0.2s;
  }

  .resizer:hover {
    background: var(--accent);
  }

  .tree-node {
    margin: 0;
    padding-left: 0;
    list-style: none;
  }

  .tree-item {
    padding: 4px 0;
    margin-left: 0;
  }

  /* Tree node styles from TreeNode component */
  :global(.tree-toggle) {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 6px;
    margin-right: 2px;
    width: 20px;
    color: var(--tree-toggle);
    font-size: 13px;
    display: inline-block;
    transition: all 0.2s;
    font-weight: 600;
  }

  :global(.tree-toggle:hover) {
    opacity: 0.8;
    transform: scale(1.15);
  }

  :global(.tree-label) {
    cursor: pointer;
    color: var(--tree-link);
    text-decoration: none;
    padding: 6px 8px;
    border-radius: 6px;
    display: inline-block;
    transition: all 0.2s;
    font-weight: 500;
  }

  :global(.tree-label:hover) {
    background-color: rgba(99, 102, 241, 0.2);
    color: var(--tree-page);
    transform: translateX(2px);
  }

  :global(.tree-folder) {
    font-weight: 600;
    color: var(--tree-folder);
    cursor: default;
    font-size: 14px;
  }

  :global(.tree-children) {
    margin-left: 12px;
  }

  .main-content {
    padding: 24px;
    overflow-y: auto;
    background-color: var(--bg-primary);
  }

  .main-content h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  h3 {
    margin-top: 20px;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color);
  }

  .modal h3 {
    margin-top: 0;
    color: var(--text-primary);
  }

  .modal p {
    color: var(--text-secondary);
    margin: 12px 0;
  }

  .conflict-item {
    padding: 12px;
    background-color: var(--bg-tertiary);
    border-left: 4px solid var(--warning);
    margin-bottom: 12px;
    border-radius: 6px;
    color: var(--text-secondary);
  }

  .source-option {
    display: flex;
    align-items: center;
    padding: 10px;
    margin: 8px 0;
    background-color: var(--bg-tertiary);
    border-radius: 6px;
    border: 1px solid var(--border-color);
    transition: border-color 0.2s;
  }

  .source-option:hover {
    border-color: var(--accent);
  }

  .source-option input[type="radio"] {
    margin-right: 10px;
    cursor: pointer;
    accent-color: var(--accent);
  }

  .source-link-button {
    background: none;
    border: none;
    color: var(--accent-light);
    cursor: pointer;
    text-decoration: none;
    padding: 0;
    margin: 0;
    transition: color 0.2s;
  }

  .source-link-button:hover {
    color: var(--accent);
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: flex-end;
  }

  .modal-buttons button {
    padding: 10px 20px;
  }

  textarea:disabled {
    background-color: var(--bg-tertiary);
    color: var(--text-tertiary);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .context-menu {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    padding: 4px 0;
    min-width: 160px;
  }

  .context-menu button {
    display: block;
    width: 100%;
    padding: 10px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary);
    transition: background-color 0.2s;
  }

  .context-menu button:hover {
    background-color: var(--bg-hover);
  }

  .orphan-list {
    list-style: none;
    padding: 0;
    margin: 8px 0 0 0;
  }

  .orphan-item {
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
    margin-bottom: 8px;
    border: 1px solid rgba(99, 102, 241, 0.2);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .orphan-item:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1));
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    transform: translateX(4px);
  }

  .orphan-item span {
    cursor: pointer;
    color: #fbbf24;
    text-decoration: none;
    flex: 1;
    font-weight: 500;
    transition: color 0.2s;
  }

  .orphan-item:hover span {
    color: #fcd34d;
  }

  .delete-orphan {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    font-size: 18px;
    padding: 4px 8px;
    line-height: 1;
    margin-left: 8px;
    display: none;
    transition: all 0.2s;
    border-radius: 4px;
  }

  .orphan-item:hover .delete-orphan {
    display: inline;
    color: var(--danger);
  }

  .delete-orphan:hover {
    background-color: rgba(239, 68, 68, 0.15);
    color: var(--danger-hover);
  }

  .dark-mode-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .toggle-switch {
    position: relative;
    width: 48px;
    height: 24px;
    background-color: var(--bg-tertiary);
    border-radius: 12px;
    cursor: pointer;
    border: 1px solid var(--border-color);
    transition: all 0.3s;
  }

  .toggle-switch.active {
    background-color: var(--accent);
    border-color: var(--accent);
  }

  .toggle-switch::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: left 0.3s;
  }

  .toggle-switch.active::after {
    left: 26px;
  }

  .viewer {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.02));
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
    min-height: 120px;
    line-height: 1.8;
    color: var(--text-primary);
  }

  .settings-modal {
    max-width: 700px;
  }

  .settings-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    border-bottom: 2px solid var(--border-color);
  }

  .settings-tab {
    padding: 10px 16px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    margin-bottom: -2px;
    box-shadow: none;
  }

  .settings-tab:hover {
    color: var(--text-primary);
    transform: none;
  }

  .settings-tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
    background-color: transparent;
  }

  .color-picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
    max-height: 400px;
    overflow-y: auto;
    padding: 12px;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
  }

  .color-picker-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .color-picker-item label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }

  .color-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .color-input-wrapper input[type="color"] {
    width: 48px;
    height: 36px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .color-input-wrapper input[type="color"]:hover {
    border-color: var(--accent);
  }

  .color-value {
    font-size: 12px;
    font-family: 'Fira Code', monospace;
    color: var(--text-tertiary);
    flex: 1;
  }

  .settings-buttons {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }

  .settings-buttons button {
    flex: 1;
  }

  .secondary-btn {
    background-color: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
    box-shadow: none !important;
  }

  .secondary-btn:hover {
    background-color: var(--bg-hover) !important;
  }
</style>

<div class="container" bind:this={container}>
  <div class="sidebar">
    <h3>Pages</h3>
    {#if browser}
      <div class="tree-node">
        <div class="tree-item">
          <TreeNode node={pageTree} {expandedNodes} {toggleNode} {loadPage} {currentTitle} populateNodeChildren={populateNodeChildrenWrapper} />
        </div>
      </div>
      {#if orphans.length > 0}
        <h4>Orphan Pages</h4>
        <ul class="orphan-list">
          {#each orphans as orphan}
            <li class="orphan-item">
              <span on:click={() => loadPage(orphan)}>{orphan}</span>
              <button class="delete-orphan" on:click={() => confirmDelete(orphan)} title="Delete page">×</button>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
  <div class="resizer" on:mousedown={startResize}></div>
  {#if browser}
    <div class="main-content">
      <h2>{currentTitle}</h2>

      <div class="controls">
        <button on:click={goBack} disabled={!canNavigateBack()}>← Back</button>
        <button on:click={goForward} disabled={!canNavigateForward()}>Forward →</button>
        <button on:click={handleExport}>Export</button>
        <button on:click={() => importInput.click()}>Import</button>
        <button on:click={() => showBackups = !showBackups}>
          {showBackups ? 'Hide' : 'Show'} Backups ({backups.length})
        </button>
        <button on:click={startSanitize}>Sanitize</button>
        <div class="dark-mode-toggle">
          <span style="font-size: 12px; color: var(--text-secondary);">{isDarkMode ? 'Dark' : 'Light'}</span>
        <button on:click={() => {
          isDarkMode = !isDarkMode;
          theme.toggleDarkMode();
        }}
          title="Toggle dark mode"
          style="padding: 6px 10px;">
          {isDarkMode ? '🌙' : '☀️'}
        </button>
        <button 
          on:click={() => showSettings = !showSettings}
          title="Color Settings"
          style="padding: 6px 10px;"
        >
          ⚙️
        </button>
      </div>
      </div>

      <input
        type="file"
        accept=".json"
        bind:this={importInput}
        on:change={handleImport}
      />

      {#if showBackups && backups.length > 0}
        <div class="backup-list">
          <strong>Recent Backups:</strong>
          {#each backups.slice().reverse() as backup (backup.timestamp)}
            <div class="backup-item">
              <span>{new Date(backup.timestamp).toLocaleString()}</span>
              <button on:click={() => handleRestoreBackup(backup.timestamp)}>
                Restore
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <textarea
        bind:value={content}
        on:input={savePage}
        on:contextmenu={handleContextMenu}
        placeholder="Type here. Use [Page Name] to link."
        disabled={isSanitizing}
      ></textarea>

      <h3>Preview</h3>
      <div
        class="viewer"
        on:click={handleClick}
        role="region"
        aria-label="Content preview"
      >
        {@html renderedContent}
      </div>
    </div>
  {/if}
</div>

{#if browser}
  {#if showContextMenu}
    <ContextMenu 
      {menuPosition} 
      {menuText}
      onMakeLink={makeWikiLink}
      onHide={hideContextMenu}
    />
  {/if}

  {#if isSanitizing && sanitizeConflicts.length > 0}
    <ConflictModal
      conflicts={sanitizeConflicts}
      {currentConflictIndex}
      {conflictResolutions}
      onResolve={resolveConflict}
      onCancel={cancelSanitize}
      onGoToSource={goToSource}
    />
  {/if}

  {#if showDeleteConfirm && pageToDelete}
    <DeleteModal
      {pageToDelete}
      onConfirm={deletePage}
      onCancel={cancelDelete}
    />
  {/if}

  {#if showSettings && currentEditingColors}
    <SettingsModal
      isDark={isDarkMode}
      colors={currentEditingColors}
      onColorChange={(colors) => {
        currentEditingColors = colors;
        theme.updateColors(isDarkMode, colors);
        applyColors(colors);
      }}
      onResetDefaults={resetColorsToDefault}
      onClose={() => {
        showSettings = false;
        theme.saveToStorage();
      }}
    />
  {/if}
{/if}


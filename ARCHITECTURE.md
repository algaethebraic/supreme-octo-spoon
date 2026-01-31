# Refactored Architecture - supreme-octo-spoon

## Overview

This document describes the refactored architecture of the supreme-octo-spoon TTRPG wiki application. The refactoring focused on improving code clarity, extensibility, maintainability, and adherence to software engineering best practices.

## Core Principles

1. **Separation of Concerns** - Each module has a single, well-defined responsibility
2. **Type Safety** - Comprehensive TypeScript types with centralized definitions
3. **Reusability** - Shared utilities extracted into dedicated modules
4. **Testability** - Pure functions and well-defined interfaces
5. **Maintainability** - Clear naming, documentation, and logical structure

---

## Project Structure

```
app/src/lib/
├── types/
│   └── index.ts              # Centralized type definitions
├── constants.ts              # Application-wide constants
├── storage/
│   ├── persistence.ts        # localStorage abstraction layer
│   └── migration.ts          # Data migration utilities
├── analysis/
│   └── linkAnalysis.ts       # Wiki link extraction and analysis
├── operations/
│   ├── index.ts              # Operations barrel export
│   ├── pageOps.ts            # Page management operations
│   ├── textOps.ts            # Text editor operations
│   ├── treeOps.ts            # Tree navigation operations
│   └── themeOps.ts           # Theme management operations
├── stores/
│   ├── pages.ts              # Primary pages store
│   ├── themes.ts             # Theme preferences store
│   └── uiState.ts            # UI state store
├── wiki.ts                   # Content rendering with links
├── tree.ts                   # Page tree structure and building
├── navigation.ts             # Navigation history management
├── sanitizer.ts              # Content sanitization
├── index.ts                  # Barrel export (empty)
├── TreeNode.svelte           # Recursive tree node component
├── components/               # UI components
└── assets/                   # Static assets
```

---

## Module Reference

### Types (`lib/types/index.ts`)

Centralized TypeScript type definitions for the entire application.

**Key Types:**
- `WikiPage` - A single wiki page (title + content)
- `WikiPageMap` - Record of pages indexed by title
- `TreeNode` - Hierarchical page navigation tree node
- `WikiBackup` - Backup snapshot with timestamp
- `LinkExtraction` - Result of link analysis

**Benefits:**
- Single source of truth for type definitions
- Eliminates circular dependencies
- Makes refactoring easier across the codebase

### Constants (`lib/constants.ts`)

Application-wide constants and configuration values.

**Categories:**
- Storage keys for localStorage
- Default values and limits
- Regex patterns for link detection
- UI dimensions and constraints

**Benefits:**
- Eliminates magic strings and numbers
- Centralized configuration management
- Easy to adjust application behavior

### Storage Layer (`lib/storage/`)

#### persistence.ts
Abstraction layer for all localStorage operations with proper error handling.

**Key Functions:**
- `loadPagesFromStorage()` - Load wiki pages
- `savePagesToStorage()` - Persist pages
- `loadBackupHistoryFromStorage()` - Load backups
- `createBackupEntry()` - Create backup snapshot
- `loadSidebarWidthFromStorage()` / `saveSidebarWidthToStorage()` - UI state persistence

**Benefits:**
- Centralized storage logic with error handling
- Easy to swap storage backends (IndexedDB, etc.)
- Better error logging and debugging

#### migration.ts
Handles data schema evolution and validation.

**Key Functions:**
- `migrateFromOldLinkSyntax()` - Convert old [[link]] to [link] format
- `normalizePageData()` - Validate and normalize page structure
- `validatePagesMap()` - Validate entire dataset
- `applyMigrations()` - Apply all necessary migrations

**Benefits:**
- Clean separation of concerns
- Easy to add new migrations
- Ensures data integrity

### Analysis Layer (`lib/analysis/`)

#### linkAnalysis.ts
Comprehensive wiki link analysis without rendering concerns.

**Key Functions:**
- `extractSourceLinks()` - Get explicit [text] links from content
- `extractProxyLinks()` - Get bare page name references
- `extractAllLinksFromPage()` - Combined link extraction
- `getPageLinks()` - Get all links for a specific page
- `getPageReferences()` - Get pages that link to a page
- `getOrphanedPages()` - Get pages not linked from anywhere
- `wouldCreateCircularDependency()` - Validate link safety

**Benefits:**
- Decoupled from rendering logic
- Reusable in multiple contexts
- Comprehensive link analysis capabilities
- Pure functions (no side effects)

### Operations Layer (`lib/operations/`)

Higher-level operations built on top of stores and utilities.

#### pageOps.ts - Page Management
- `loadPage()` - Load/create pages with history management
- `savePage()` - Persist page content
- `deletePage()` - Remove pages
- `pageExists()` - Check page existence
- `renamePage()` - Rename pages safely
- `getPageStats()` - Get metadata about pages

#### textOps.ts - Text Editor
- `getWordAtCursor()` - Extract word at cursor position
- `isAlreadyLinked()` - Check if text is linked
- `insertWikiLink()` - Wrap text in [brackets]
- `getSelectedText()` - Get textarea selection
- `replaceSelectedText()` - Replace selection
- `insertTextAtCursor()` - Insert text at position

#### treeOps.ts - Tree Navigation
- `createTreeToggleStore()` - Writable store with toggle/expand/collapse
- `loadExpandedNodesFromStorage()` - Load tree state
- `saveExpandedNodesToStorage()` - Persist tree state
- `loadSidebarWidth()` / `saveSidebarWidth()` - UI dimensions

#### themeOps.ts - Theme Management
- Theme color manipulation and persistence

**Benefits:**
- Consistent operation interface
- Clear input/output contracts
- Easier testing and mocking
- Separation from component logic

### Core Modules

#### wiki.ts - Content Rendering
Handles converting wiki markup to HTML with proper link styling.

**Key Functions:**
- `parseWikiLinks()` - Extract and transform wiki links
- `renderContent()` - Render page content with HTML links

**Changes:**
- Now uses `linkAnalysis` module for link extraction
- Cleaner separation between parsing and rendering logic
- Better JSDoc documentation

#### tree.ts - Page Tree Structure
Creates hierarchical navigation tree from wiki links.

**Key Functions:**
- `buildPageTree()` - Build root tree from Home page
- `populateNodeChildren()` - Lazy-load child nodes on expansion
- `collectAllNodePaths()` - Get all paths in tree
- `findNodeByPath()` - Find node by path
- `getNodeDepth()` - Calculate node depth

**Improvements:**
- Uses `linkAnalysis` for link extraction
- Better encapsulation and documentation
- Re-exports `TreeNode` type for convenience

#### stores/pages.ts - Primary Store
Manages all wiki pages with automatic persistence and backups.

**Key Features:**
- Automatic localStorage persistence
- Backup creation on every change
- Data migration on load
- Export/import functionality
- Type-safe store with WikiPageMap

**Refactoring:**
- Uses new `persistence` and `migration` modules
- Cleaner initialization logic
- Better separation from UI concerns

#### stores/uiState.ts - UI State
Manages all UI-related state (sidebar, modals, menus, etc.)

**Note:** Already well-organized in original codebase.

### Components

#### TreeNode.svelte
Recursive tree node component for hierarchical display.

**Refactoring:**
- Now uses centralized `TreeNode` type from `$lib/types`
- Eliminates duplicate type definitions
- Better type consistency with rest of app

---

## Data Flow

### Creating/Saving a Page

```
User Input
    ↓
+page.svelte (component)
    ↓
loadPageOp() (operation)
    ↓
pages store (writable)
    ↓
savePagesToStorage() (persistence)
    ↓
localStorage
```

### Rendering Links

```
Page Content
    ↓
renderContent() (wiki.ts)
    ↓
extractSourceLinks() (linkAnalysis.ts)
    ↓
parseWikiLinks() (wiki.ts)
    ↓
HTML Output with <a> tags
```

### Building Navigation Tree

```
All Pages
    ↓
buildPageTree() (tree.ts)
    ↓
getAllWikiLinks() → getPageLinks() (linkAnalysis.ts)
    ↓
TreeNode Structure
    ↓
TreeNode.svelte (component)
```

---

## Key Improvements

### 1. Type Safety
- **Before:** Scattered type definitions, some implicit
- **After:** Centralized types in `lib/types/index.ts` with full documentation

### 2. Storage Logic
- **Before:** Direct localStorage calls scattered throughout
- **After:** Abstracted in `persistence.ts` with error handling

### 3. Link Analysis
- **Before:** Regex parsing mixed with rendering concerns
- **After:** Dedicated `linkAnalysis.ts` module with pure functions

### 4. Testability
- **Before:** Tightly coupled logic difficult to test in isolation
- **After:** Pure functions and clear separation of concerns

### 5. Maintainability
- **Before:** Magic strings and numbers throughout codebase
- **After:** Centralized constants in `constants.ts`

### 6. Documentation
- **Before:** Minimal JSDoc comments
- **After:** Comprehensive JSDoc for all public functions

### 7. Error Handling
- **Before:** Silent failures or console errors
- **After:** Consistent error handling throughout persistence layer

### 8. Code Organization
- **Before:** Functions scattered in various files
- **After:** Logical grouping in `operations/` and `analysis/` directories

---

## Testing Strategy

### Unit Tests
- `wiki.test.ts` - Tests link parsing and rendering
- `pages.test.ts` - Tests store functionality

### Test Coverage
- Link extraction and parsing
- Data migrations
- Store persistence
- Backup creation/restoration

### Running Tests
```bash
npm test              # Run all tests
npm test -- --watch  # Watch mode
npm test -- --ui     # UI mode
```

---

## Future Extensibility

### Adding New Features

1. **New Operation Type**
   - Create file in `lib/operations/`
   - Export from `lib/operations/index.ts`
   - Use in components

2. **New Link Type**
   - Add to `LinkExtraction` type in `lib/types/`
   - Update `extractSourceLinks()` / `extractProxyLinks()` in `linkAnalysis.ts`
   - Update rendering logic in `wiki.ts`

3. **New Storage Backend**
   - Create alternative to `persistence.ts`
   - Update store subscriptions in `pages.ts`
   - No component changes needed

4. **New Migration**
   - Add function to `lib/storage/migration.ts`
   - Call in `applyMigrations()` during store initialization

---

## Performance Considerations

1. **Tree Building** - Currently built on every render
   - Could be memoized or built incrementally
   - See TODO in `+page.svelte`

2. **Link Analysis** - Regex operations on every render
   - Could be cached based on content hash
   - Consider incremental analysis

3. **localStorage Limits** - Max 5-10MB on most browsers
   - Current backup strategy could fill storage
   - Consider cleanup logic or IndexedDB migration

---

## Migration Guide for Contributors

### Old Pattern → New Pattern

**Old: Direct localStorage access**
```ts
localStorage.setItem('key', JSON.stringify(data));
```

**New: Use persistence module**
```ts
import { savePagesToStorage } from '$lib/storage/persistence';
savePagesToStorage(data);
```

---

**Old: Scattered type definitions**
```ts
export type WikiPage = { title: string; content: string; };
```

**New: Import from centralized types**
```ts
import type { WikiPage } from '$lib/types';
```

---

**Old: Link analysis in rendering**
```ts
function render(content) {
  const regex = /\[([^\]]+)\]/g;
  // ...
}
```

**New: Separate concerns**
```ts
import { extractSourceLinks } from '$lib/analysis/linkAnalysis';
const links = extractSourceLinks(content);
```

---

## Common Tasks

### Adding a New Page Field
1. Update `WikiPage` type in `lib/types/index.ts`
2. Update migration function in `lib/storage/migration.ts`
3. Update component to display/edit field
4. Add tests if needed

### Changing Link Syntax
1. Update regex in `lib/constants.ts`
2. Update `extractSourceLinks()` in `linkAnalysis.ts`
3. Add migration function in `lib/storage/migration.ts`
4. Update component rendering in `wiki.ts`

### Adding Theme Colors
1. Update `ColorScheme` type in `lib/types/index.ts`
2. Update `themeOps.ts` with new color handling
3. Update `SettingsModal.svelte` to show new color picker
4. Update CSS variables in component styles

---

## Conclusion

The refactored architecture provides:

✅ **Clarity** - Clear separation of concerns  
✅ **Maintainability** - Well-organized, documented code  
✅ **Testability** - Pure functions and isolated modules  
✅ **Extensibility** - Easy to add new features  
✅ **Type Safety** - Comprehensive TypeScript coverage  
✅ **Performance** - Optimized data flow and caching ready  

The codebase is now positioned for growth and long-term maintenance while remaining intuitive for new contributors.

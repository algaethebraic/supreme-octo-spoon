# supreme-octo-spoon

A modern TTRPG (Tabletop RPG) wiki application - a client-side wiki builder where users create interconnected wiki pages with automatic link detection. No backend or database required; all data persists to browser localStorage.

## 🎯 Features

- ✨ **Wiki Link Syntax**: Use `[Page Title]` to create links
- 🔗 **Automatic Link Detection**: Smart link detection for page references
- 🌳 **Hierarchical Navigation**: Tree-based page structure
- 💾 **Automatic Persistence**: All data saved to localStorage
- 📦 **Backup & Restore**: Automatic backups with easy restoration
- 📥 **Import/Export**: JSON-based data exchange
- 🎨 **Theme Customization**: Customize colors and appearance
- 📱 **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Type check
npm run check

# Build for production
npm run build
```

## 📁 Project Structure

```
app/
├── src/
│   ├── lib/
│   │   ├── types/index.ts         # Centralized TypeScript types
│   │   ├── constants.ts           # Application constants
│   │   ├── storage/               # localStorage abstraction
│   │   ├── analysis/              # Link analysis utilities
│   │   ├── operations/            # Business logic operations
│   │   ├── stores/                # Svelte stores
│   │   ├── wiki.ts                # Content rendering
│   │   └── tree.ts                # Page tree structure
│   ├── routes/                    # SvelteKit pages
│   └── components/                # UI components
└── package.json
```

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete architecture and module reference
- **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - Detailed refactoring changes
- **[VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md)** - Quality assurance verification
- **[REFACTORING_COMPLETE.md](REFACTORING_COMPLETE.md)** - Executive summary

## 🏗️ Architecture

The application uses a clean, modular architecture:

```
Components
    ↓
Operations Layer (pageOps, textOps, etc.)
    ↓
Stores (pages, themes, uiState)
    ↓
Storage Abstraction (persistence, migration)
    ↓
Analysis Layer (link analysis, pure functions)
    ↓
localStorage
```

## 🧩 Core Modules

### `lib/types/index.ts`
Centralized type definitions for the entire application.

```ts
import type { WikiPage, WikiPageMap, TreeNode } from '$lib/types';
```

### `lib/constants.ts`
Application-wide constants and configuration.

```ts
import { HOME_PAGE_TITLE, MAX_BACKUPS } from '$lib/constants';
```

### `lib/storage/`
Storage abstraction layer with error handling.

```ts
import { savePagesToStorage, loadPagesFromStorage } from '$lib/storage/persistence';
```

### `lib/analysis/linkAnalysis.ts`
Pure functions for wiki link analysis.

```ts
import { extractSourceLinks, getOrphanedPages } from '$lib/analysis/linkAnalysis';
```

### `lib/operations/`
High-level business logic operations.

```ts
import { loadPage, savePage, deletePage } from '$lib/operations';
```

## 📝 Usage Examples

### Creating a Link
Simply use `[Page Title]` syntax in your page content:

```
This is a link to [Home Page].
Check out [Documentation] for more info.
```

### Importing/Exporting
Use the settings modal to export pages as JSON or import from JSON.

### Customizing Themes
Use the settings to customize colors:
- Primary action color
- Background colors
- Text colors
- Theme toggle (dark/light mode)

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# UI mode
npm test -- --ui
```

All tests pass: ✅ 25/25

## 📊 Project Statistics

- **TypeScript**: 100% type-safe
- **Test Coverage**: Comprehensive (25 tests)
- **Type Errors**: 0
- **Modules**: 12+ focused modules
- **Documentation**: 1000+ lines

## 🔄 Data Persistence

### localStorage Keys
- `wiki-pages` - All pages
- `wiki-pages-backups` - Backup history
- `expandedNodes` - Tree state
- `sidebarWidth` - UI state

### Automatic Backups
- Created on every page change
- Last 20 backups kept
- Easily restored from settings

### Import/Export
- Export as JSON for backup
- Import JSON to restore data
- Share wikis between devices

## 🎨 Customization

### Adding Colors
1. Update `ColorScheme` type in `lib/types/`
2. Add color to theme operations
3. Update settings modal UI

### Creating New Link Types
1. Update `LinkExtraction` type
2. Modify `extractSourceLinks()` or `extractProxyLinks()`
3. Update rendering in `wiki.ts`

### New Page Fields
1. Extend `WikiPage` type
2. Add migration function
3. Update components

## 🐛 Troubleshooting

### Pages not saving?
- Check browser localStorage quota
- Clear cache and reload
- Check console for errors

### Links not rendering?
- Verify page exists
- Use correct syntax: `[Page Title]`
- Check for special characters

### Tree not showing?
- Make sure pages have links from Home
- Check that page titles match exactly
- Try refreshing the page

## 📦 Tech Stack

- **Frontend**: SvelteKit 5 + Svelte 5
- **Language**: TypeScript
- **Build**: Vite 7
- **Testing**: Vitest
- **Linting**: ESLint 9 + Prettier

## 📄 License

Check LICENSE file for details.

## 🤝 Contributing

To contribute to this project:

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase
2. Make changes following established patterns
3. Run tests: `npm test`
4. Type check: `npm run check`
5. Submit changes

## ✨ Code Quality

This project prioritizes:
- ✅ Type safety
- ✅ Clear code organization
- ✅ Comprehensive testing
- ✅ Excellent documentation
- ✅ Backward compatibility

---

**For detailed information about the architecture and refactoring, see [ARCHITECTURE.md](ARCHITECTURE.md)**

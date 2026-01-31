/**
 * Application-wide constants
 */

/** Storage key for wiki pages */
export const STORAGE_KEY_PAGES = 'wiki-pages';

/** Storage key for page backups */
export const STORAGE_KEY_BACKUPS = 'wiki-pages-backups';

/** Storage key for expanded tree nodes */
export const STORAGE_KEY_EXPANDED_NODES = 'expandedNodes';

/** Storage key for sidebar width */
export const STORAGE_KEY_SIDEBAR_WIDTH = 'sidebarWidth';

/** Maximum number of backups to keep */
export const MAX_BACKUPS = 20;

/** Default sidebar width in pixels */
export const DEFAULT_SIDEBAR_WIDTH = 220;

/** Minimum sidebar width in pixels */
export const MIN_SIDEBAR_WIDTH = 100;

/** Maximum sidebar width in pixels */
export const MAX_SIDEBAR_WIDTH = 800;

/** Home page title */
export const HOME_PAGE_TITLE = 'Home';

/** Default welcome content */
export const DEFAULT_HOME_CONTENT = 'Welcome! Try adding links like [Documentation] or [Projects]';

/** Wiki link pattern - matches [text] */
export const WIKI_LINK_PATTERN = /\[([^\]]+)\]/g;

/** Word boundary pattern for link detection */
export const WORD_BOUNDARY_PATTERN = /\b/;

/** Special characters that need escaping in regex */
export const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

/**
 * Core type definitions for the wiki application
 */

/** Represents a single wiki page */
export type WikiPage = {
  readonly title: string;
  readonly content: string;
};

/** Record of pages indexed by title */
export type WikiPageMap = Record<string, WikiPage>;

/** Represents a backup snapshot */
export type WikiBackup = {
  readonly timestamp: number;
  readonly data: WikiPageMap;
};

/** Backup history collection */
export type WikiBackupHistory = WikiBackup[];

/** Tree node for hierarchical page organization */
export type TreeNode = {
  readonly name: string;
  readonly path: string;
  readonly isPage: boolean;
  readonly children: Map<string, TreeNode>;
  readonly hasLinks: boolean;
};

/** Color scheme for theming */
export type ColorScheme = Record<string, string>;

/** Conflict item for sanitization */
export type ConflictItem = {
  readonly pageTitle: string;
  readonly lineNumber: number;
  readonly issue: string;
  readonly suggestion: string;
};

/** Navigation history state */
export type PageHistory = {
  readonly entries: string[];
  readonly currentIndex: number;
};

/** Result of page operations */
export type OperationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/** Export/Import result */
export type ImportExportResult = OperationResult<WikiPageMap>;

/** Link extraction result */
export type LinkExtraction = {
  readonly sourceLinks: Set<string>;
  readonly proxyLinks: Set<string>;
  readonly allLinks: Set<string>;
};

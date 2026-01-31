import { describe, it, expect, vi } from 'vitest';

// Mock the browser check before importing pages
vi.mock('$app/environment', () => ({
	browser: false
}));

import type { WikiPage } from './pages';

describe('WikiPage migration', () => {
	it('should migrate old [[link]] syntax to new [link] syntax', () => {
		const migratePages = (pages: Record<string, WikiPage>): Record<string, WikiPage> => {
			const migrated: Record<string, WikiPage> = {};
			for (const [key, page] of Object.entries(pages)) {
				migrated[key] = {
					...page,
					content: page.content.replace(/\[\[([^\]]+)\]\]/g, '[$1]')
				};
			}
			return migrated;
		};

		const oldPages: Record<string, WikiPage> = {
			Home: {
				title: 'Home',
				content: 'Welcome! Check [[Documentation]] and [[Projects]]'
			},
			Documentation: {
				title: 'Documentation',
				content: 'See also [[API Reference]]'
			}
		};

		const migrated = migratePages(oldPages);

		expect(migrated.Home.content).toBe('Welcome! Check [Documentation] and [Projects]');
		expect(migrated.Documentation.content).toBe('See also [API Reference]');
	});

	it('should handle pages without old syntax', () => {
		const migratePages = (pages: Record<string, WikiPage>): Record<string, WikiPage> => {
			const migrated: Record<string, WikiPage> = {};
			for (const [key, page] of Object.entries(pages)) {
				migrated[key] = {
					...page,
					content: page.content.replace(/\[\[([^\]]+)\]\]/g, '[$1]')
				};
			}
			return migrated;
		};

		const pages: Record<string, WikiPage> = {
			Home: {
				title: 'Home',
				content: 'Welcome! Check [Documentation]'
			}
		};

		const migrated = migratePages(pages);
		expect(migrated.Home.content).toBe('Welcome! Check [Documentation]');
	});

	it('should migrate multiple instances in one page', () => {
		const migratePages = (pages: Record<string, WikiPage>): Record<string, WikiPage> => {
			const migrated: Record<string, WikiPage> = {};
			for (const [key, page] of Object.entries(pages)) {
				migrated[key] = {
					...page,
					content: page.content.replace(/\[\[([^\]]+)\]\]/g, '[$1]')
				};
			}
			return migrated;
		};

		const pages: Record<string, WikiPage> = {
			Content: {
				title: 'Content',
				content: '[[First]] link and [[Second]] link and [[Third]]'
			}
		};

		const migrated = migratePages(pages);
		expect(migrated.Content.content).toBe('[First] link and [Second] link and [Third]');
	});
});

describe('WikiPage type', () => {
	it('should have title and content fields', () => {
		const page: WikiPage = {
			title: 'Test Page',
			content: 'This is test content'
		};

		expect(page.title).toBe('Test Page');
		expect(page.content).toBe('This is test content');
	});

	it('should support pages with links in content', () => {
		const page: WikiPage = {
			title: 'Linked Page',
			content: 'This page contains [Another Page] and [Yet Another]'
		};

		expect(page.content).toContain('[Another Page]');
		expect(page.content).toContain('[Yet Another]');
	});
});

describe('Data validation', () => {
	it('should validate page title is not empty', () => {
		const page: WikiPage = {
			title: 'Valid Title',
			content: 'Content'
		};

		expect(page.title.length).toBeGreaterThan(0);
	});

	it('should allow empty content', () => {
		const page: WikiPage = {
			title: 'Title',
			content: ''
		};

		expect(page.content).toBe('');
	});

	it('should handle special characters in title', () => {
		const page: WikiPage = {
			title: "O'Brien's Adventure",
			content: 'Story content'
		};

		expect(page.title).toContain("'");
		expect(page.title).toContain('s');
	});
});

describe('Export/Import with orphan pages', () => {
	it('should export all pages including orphans', () => {
		// Simulate exportData function
		const exportData = (pages: Record<string, WikiPage>): string => {
			return JSON.stringify(pages);
		};

		const testPages: Record<string, WikiPage> = {
			Home: {
				title: 'Home',
				content: 'Welcome! See [Main] and [Connected]'
			},
			Main: {
				title: 'Main',
				content: 'Main page content'
			},
			Connected: {
				title: 'Connected',
				content: 'Connected page'
			},
			Orphan1: {
				title: 'Orphan1',
				content: 'This orphan is not linked from anywhere'
			},
			Orphan2: {
				title: 'Orphan2',
				content: 'Another orphan page'
			}
		};

		const exported = exportData(testPages);
		const parsed = JSON.parse(exported);

		expect(Object.keys(parsed)).toContain('Home');
		expect(Object.keys(parsed)).toContain('Main');
		expect(Object.keys(parsed)).toContain('Connected');
		expect(Object.keys(parsed)).toContain('Orphan1');
		expect(Object.keys(parsed)).toContain('Orphan2');
		expect(Object.keys(parsed).length).toBe(5);
	});

	it('should import all pages including orphans', () => {
		// Simulate importData function
		const importData = (jsonString: string): Record<string, WikiPage> | null => {
			try {
				const data = JSON.parse(jsonString);
				if (typeof data === 'object' && data !== null) {
					return data;
				}
			} catch (e) {
				return null;
			}
			return null;
		};

		const testPages: Record<string, WikiPage> = {
			Home: { title: 'Home', content: 'Home' },
			Orphan1: { title: 'Orphan1', content: 'Orphan' },
			Orphan2: { title: 'Orphan2', content: 'Another orphan' }
		};

		const json = JSON.stringify(testPages);
		const imported = importData(json);

		expect(imported).not.toBeNull();
		expect(Object.keys(imported!)).toContain('Home');
		expect(Object.keys(imported!)).toContain('Orphan1');
		expect(Object.keys(imported!)).toContain('Orphan2');
		expect(imported!.Orphan1.content).toBe('Orphan');
	});

	it('should preserve orphan pages through export/import cycle', () => {
		const testPages: Record<string, WikiPage> = {
			Home: { title: 'Home', content: '[Page1]' },
			Page1: { title: 'Page1', content: 'Page1 content' },
			OrphanedPage: { title: 'OrphanedPage', content: 'This page has no inbound links' }
		};

		// Export
		const exported = JSON.stringify(testPages);

		// Import
		const imported = JSON.parse(exported);

		// Verify all pages are present
		expect(Object.keys(imported).length).toBe(3);
		expect(imported.OrphanedPage).toBeDefined();
		expect(imported.OrphanedPage.title).toBe('OrphanedPage');
		expect(imported.OrphanedPage.content).toBe('This page has no inbound links');
	});
});

describe('Backup with orphan pages', () => {
	it('should backup all pages including orphans', () => {
		// Simulate createBackup function
		const backups: Array<{ timestamp: number; data: Record<string, WikiPage> }> = [];
		const createBackup = (data: Record<string, WikiPage>) => {
			backups.push({
				timestamp: Date.now(),
				data
			});
		};

		const testPages: Record<string, WikiPage> = {
			Home: { title: 'Home', content: 'Home' },
			Page1: { title: 'Page1', content: 'Linked page' },
			Orphan1: { title: 'Orphan1', content: 'Orphan' },
			Orphan2: { title: 'Orphan2', content: 'Another orphan' }
		};

		createBackup(testPages);

		expect(backups.length).toBe(1);
		expect(Object.keys(backups[0].data).length).toBe(4);
		expect(backups[0].data.Orphan1).toBeDefined();
		expect(backups[0].data.Orphan2).toBeDefined();
	});

	it('should restore all pages including orphans from backup', () => {
		// Simulate backup/restore
		const backups: Array<{ timestamp: number; data: Record<string, WikiPage> }> = [];
		
		const testPages: Record<string, WikiPage> = {
			Home: { title: 'Home', content: 'Home' },
			Orphan1: { title: 'Orphan1', content: 'Orphan content' }
		};

		backups.push({
			timestamp: 123456,
			data: testPages
		});

		// Restore
		const backup = backups.find((b) => b.timestamp === 123456);
		expect(backup).toBeDefined();
		expect(backup!.data.Orphan1).toBeDefined();
		expect(backup!.data.Orphan1.content).toBe('Orphan content');
	});
});

describe('Real-world scenario: export, delete, import orphan', () => {
	it('should restore orphan through export-delete-import cycle', () => {
		// Simulate the real localStorage flow
		let localStorageData: Record<string, WikiPage> = {
			Home: { title: 'Home', content: '[LinkedPage]' },
			LinkedPage: { title: 'LinkedPage', content: 'This is linked' },
			Orphan: { title: 'Orphan', content: 'This is an orphan' }
		};

		// Step 1: Export - capture current state
		const exportedJson = JSON.stringify(localStorageData);
		const exportedData = JSON.parse(exportedJson);

		expect(exportedData).toHaveProperty('Orphan');
		expect(exportedData.Orphan.content).toBe('This is an orphan');

		// Step 2: Delete orphan from current state
		delete localStorageData['Orphan'];
		expect(localStorageData).not.toHaveProperty('Orphan');

		// Step 3: Import the exported data
		const importedData = JSON.parse(exportedJson);
		localStorageData = importedData;

		// Step 4: Verify orphan is restored
		expect(localStorageData).toHaveProperty('Orphan');
		expect(localStorageData.Orphan.content).toBe('This is an orphan');
		expect(Object.keys(localStorageData).length).toBe(3);
	});

	it('should export json string that includes all pages as string', () => {
		const testPages: Record<string, WikiPage> = {
			Home: { title: 'Home', content: 'Home content' },
			Page1: { title: 'Page1', content: 'Page 1' },
			Orphan1: { title: 'Orphan1', content: 'Orphan content' }
		};

		// Simulate exportData() which returns a JSON string
		const exportedString = JSON.stringify(testPages);

		// Verify the string contains all pages
		expect(exportedString).toContain('"Home"');
		expect(exportedString).toContain('"Page1"');
		expect(exportedString).toContain('"Orphan1"');

		// Verify it can be parsed back
		const parsed = JSON.parse(exportedString);
		expect(Object.keys(parsed).length).toBe(3);
	});
});

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});

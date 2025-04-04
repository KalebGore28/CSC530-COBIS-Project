import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
		include: ['src/tests/**/*.test.ts'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
});
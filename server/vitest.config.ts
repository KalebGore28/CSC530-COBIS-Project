import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
		include: ['src/tests/**/*.test.ts'],
		coverage: {
			provider: 'v8', // or 'istanbul'
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.ts'], // Include all TypeScript files in src
			exclude: [
				'node_modules/**',
				'src/tests/**',
				'src/routes/**/*.ts', // We are excluding the routes folder because, with the code pattern we are using, we can directly test the controller
				'src/lib/**/*.ts', // Exclude lib files
				'src/types/**/*.ts', // Exclude type files
				'src/specs/**/*.ts', // Exclude specs
				'src/seed/**/*.ts', // Exclude seed files
				'src/db/**/*.ts', // Exclude db files
				'**/*.d.ts',
				'**/*.test.ts',
			],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
});
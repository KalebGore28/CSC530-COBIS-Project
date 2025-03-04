// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		// Only consider test files in the src/test folder
		include: ['src/tests/**/*.{ts,js}'],
		// Exclude any folders you don't want to run tests from (e.g. node_modules, build artifacts)
		exclude: ['node_modules', 'dist', 'build'],
		coverage: {
			provider: 'v8', // or 'istanbul' if you prefer
			reporter: ['text', 'html'],
			// Instrument only these directories for coverage
			include: [
				'src/routes/**/*.{ts,js}',
				'src/utils/**/*.{ts,js}',
			],
			// Exclude test files and any other directories not meant for coverage instrumentation
			exclude: [
				'node_modules',
				'src/tests/**/*',
				'src/db/**/*',
			],
		},
	},
});
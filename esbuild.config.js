import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { builtinModules } from 'module';
import { execSync } from 'child_process';

async function build() {
	try {
		// Build cobis-app (Vite)
		console.log('Building cobis-app...');
		execSync('npm run build --workspace=cobis-app', { stdio: 'inherit' });

		// Build cobis-server
		console.log('Building cobis-server...');
		await esbuild.build({
			entryPoints: ['packages/server/src/index.ts'],
			outfile: 'dist/server.js',
			bundle: true,
			platform: 'node',
			target: 'esnext',
			format: 'esm',
			sourcemap: true,
			external: [
				...builtinModules,
				'express',
				'better-auth',
				'drizzle-orm',
				'dotenv',
				'better-sqlite3',
				// Add other dependencies from packages/server/package.json
			],
			tsconfig: 'packages/server/tsconfig.json',
			logLevel: 'info',
			plugins: [
				copy({
					resolveFrom: 'cwd',
					assets: [
						{
							from: ['packages/app/dist/**/*'],
							to: ['dist/public'],
						},
						{
							from: ['packages/server/src/graphql/schema.graphql'],
							to: ['dist/schema.graphql'],
						},
					],
				}),
			],
		});

		console.log('Build succeeded');
	} catch (error) {
		console.error('Build failed:', error);
		process.exit(1);
	}
}

build();
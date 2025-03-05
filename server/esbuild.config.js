import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

// Build backend
esbuild.build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/server.cjs',
    bundle: true,
    platform: 'node',
    target: 'es2022',
    format: 'cjs',
    sourcemap: true,
    external: ['better-sqlite3'],
    logLevel: 'info',
    plugins: [
        copy({
            assets: {
                from: ['../client/dist/**/*'],  // Include all files and subdirectories
                to: ['public'],         // Destination in backend dist
            }
        })
    ]
}).then(() => {
    console.log('Build succeeded');
}).catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
});
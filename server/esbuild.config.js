import esbuild from 'esbuild';

esbuild.build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/server.cjs',
    bundle: true,
    platform: 'node',
    target: 'es2022',
    format: 'cjs',
    sourcemap: true,
    external: [
        'better-sqlite3'  // Exclude better-sqlite3 from bundling
    ],
    logLevel: 'info'
}).then(() => {
    console.log('Build succeeded');
}).catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
});
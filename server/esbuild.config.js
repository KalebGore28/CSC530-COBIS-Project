import { build } from 'esbuild';
import { builtinModules } from 'module';

build({
  entryPoints: ['index.js'], // Change this if your main file is different
  outfile: 'dist/server.js', // Output bundled file
  platform: 'node', // Target Node.js
  format: 'esm', // Use ESM for modern support
  bundle: true, // Bundle dependencies
  minify: true, // Minify output for production
  sourcemap: true, // Generate source maps
  external: [...builtinModules, 'express', 'mssql', 'pdfmake'], // Exclude built-in modules & some dependencies
  logLevel: 'info',
}).catch(() => process.exit(1));
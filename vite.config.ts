import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

const config = defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        server: {
            port: env.PORT ? parseInt(env.PORT) : 3000,
        },
        plugins: [
            // this is the plugin that enables path aliases
            viteTsConfigPaths({
                projects: ['./tsconfig.json'],
            }),
            tailwindcss(),
            tanstackStart(),
            viteReact(),
        ],
        define: {
            'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
        },
    }
})

export default config

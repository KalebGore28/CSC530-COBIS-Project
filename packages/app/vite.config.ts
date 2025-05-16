import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import relay from "vite-plugin-relay";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), relay],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@cobis/types': path.resolve(__dirname, '../types/src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: '192.168.1.107', // Explicit WebSocket host for HMR
      port: 5173,
      protocol: 'ws', // Use ws (not wss, unless you have SSL)
    },
    proxy: {
      '/api': {
        target: 'http://192.168.1.107:4000',
        changeOrigin: true,
      }
    },
  }
})

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
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    },
  }
})

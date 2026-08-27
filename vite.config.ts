import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import pkg from "./package.json";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_NAME__: JSON.stringify(pkg.name),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React runtime
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/zustand/') ||
              id.includes('/framer-motion/')
            ) {
              return 'vendor-react-core'
            }
            if (id.includes('@tauri-apps')) {
              return 'vendor-tauri'
            }
            if (id.includes('@monaco-editor') || id.includes('/monaco-editor/')) {
              return 'vendor-monaco'
            }
            if (id.includes('@xterm')) {
              return 'vendor-xterm'
            }
            if (id.includes('/xlsx/')) {
              return 'vendor-xlsx'
            }
          }
        },
      },
    },
  },
}));

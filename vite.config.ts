import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable minification
    minify: 'esbuild',
    // Generate sourcemaps for debugging but keep them external
    sourcemap: false,
    // Optimize chunk splitting for faster initial load
    rollupOptions: {
      output: {
        // Use hashed names for better caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Core React - absolutely critical, loads first
          if (id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/scheduler')) {
            return 'react-core';
          }
          // Router - needed for initial navigation
          if (id.includes('react-router')) {
            return 'router';
          }
          // Heavy libraries - lazy loaded only when needed
          if (id.includes('framer-motion')) {
            return 'framer';
          }
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          if (id.includes('html2canvas')) {
            return 'canvas';
          }
          // Radix UI - used throughout but can be deferred
          if (id.includes('@radix-ui')) {
            return 'radix';
          }
          // Tanstack query - deferred
          if (id.includes('@tanstack')) {
            return 'query';
          }
        },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 500,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Exclude heavy deps from pre-bundling
    exclude: ['html2canvas'],
  },
}));

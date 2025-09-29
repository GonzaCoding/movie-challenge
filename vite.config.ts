import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolveFromRoot = (relativePath: string) => resolve(__dirname, relativePath);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': resolveFromRoot('./src/components'),
      '@app': resolveFromRoot('./src/app'),
      '@redux': resolveFromRoot('./src/redux'),
      '@queries': resolveFromRoot('./src/queries'),
      '@types': resolveFromRoot('./src/types'),
      '@utils': resolveFromRoot('./src/utils'),
      '@styles': resolveFromRoot('./src/styles'),
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.themoviedb.org/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  ssr: {
    noExternal: ['react-router-dom', '@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],
    external: ['react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
});

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
  server: {
    proxy: {
      '/api': {
        target: 'https://api.themoviedb.org/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  ssr: {
    noExternal: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      '@tanstack/react-query',
    ],
  },
});

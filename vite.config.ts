import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@app': path.resolve(__dirname, './src/app'),
      '@redux': path.resolve(__dirname, './src/redux'),
      '@queries': path.resolve(__dirname, './src/queries'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        client: 'src/entry-client.tsx',
        server: 'src/entry-server.tsx',
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'server' ? 'server/entry-server.js' : 'client/[name]-[hash].js';
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

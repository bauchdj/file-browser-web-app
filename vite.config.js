// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'gui/public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'), // Optional: specify output directory for build
  },
  server: {
    open: '/gui/public/index.html',
  }
});


import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: { exportType: 'default', ref: true, svgo: false, titleProp: true },
      include: '**/*.svg?react',
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
});

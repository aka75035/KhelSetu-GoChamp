import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './', // Important for Capacitor apps - ensures relative paths
  build: {
    target: 'esnext',
    outDir: 'dist', // Match with capacitor.config.json webDir
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true, // Allow access from mobile devices
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
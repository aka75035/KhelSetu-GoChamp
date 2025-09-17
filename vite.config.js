import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        '@awesome-cordova-plugins/core', // Mark this module as external
      ],
    },
  },
});
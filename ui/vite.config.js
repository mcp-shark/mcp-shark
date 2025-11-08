import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9853',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:9853',
        ws: true,
      },
    },
  },
});

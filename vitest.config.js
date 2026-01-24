import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./ui/src/setupTests.js'],
    include: ['ui/src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage-ui',
      include: ['ui/src/**/*.{js,jsx}'],
      exclude: ['**/__tests__/**', '**/*.test.{js,jsx}', 'ui/src/main.jsx'],
    },
  },
});

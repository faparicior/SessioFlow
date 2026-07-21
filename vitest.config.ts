import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      // Use backend app for tests that need @backend imports
      '@backend': path.resolve(__dirname, './apps/backend/src'),
      '@backend/*': path.resolve(__dirname, './apps/backend/src/*'),
      // Keep frontend for specific tests
      '@frontend': path.resolve(__dirname, './apps/frontend/src'),
      '@frontend/*': path.resolve(__dirname, './apps/frontend/src/*'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/frontend/**'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});

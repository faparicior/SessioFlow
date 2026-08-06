import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@sessioflow/shared-domain': path.resolve(__dirname, './packages/shared/domain/src'),
      '@sessioflow/shared-domain/*': path.resolve(__dirname, './packages/shared/domain/src/*'),
      '@sessioflow/shared-http': path.resolve(__dirname, './packages/shared/http/src'),
      '@sessioflow/shared-http/*': path.resolve(__dirname, './packages/shared/http/src/*'),
      '@sessioflow/conference': path.resolve(__dirname, './packages/modules/conference/src'),
      '@sessioflow/conference/*': path.resolve(__dirname, './packages/modules/conference/src/*'),
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
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/frontend/**'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});

import path from 'node:path';
import {defineConfig, devices} from '@playwright/test';

const rootDir = path.resolve(import.meta.dirname, '../..');

/**
 * Playwright configuration for E2E testing.
 *
 * Tests the complete user journey from form submission to dashboard redirect.
 */
export default defineConfig({
  testDir: path.resolve(rootDir, 'tests/e2e'),
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  globalSetup: path.resolve(rootDir, 'tests/e2e/setup'),
  globalTeardown: path.resolve(rootDir, 'tests/e2e/teardown'),
  use: {
    baseURL: 'http://localhost:3010',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3010',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    cwd: path.resolve(rootDir, 'apps/frontend'),
  },
});

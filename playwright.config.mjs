import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 90_000,          // PBKDF2 (210k + 600k iterations) is slow on purpose
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:8322',
    ...devices['Pixel 7'],
    serviceWorkers: 'block',  // tests the page itself, not a cached copy
  },
  webServer: {
    command: 'node tests/serve.mjs 8322',
    url: 'http://localhost:8322/index.html',
    reuseExistingServer: !process.env.CI,
  },
});

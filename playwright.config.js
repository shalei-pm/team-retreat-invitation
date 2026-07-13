import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'mobile-chrome',
      testMatch: /invitation\.spec\.js/,
      use: { ...devices['iPhone 13'], browserName: 'chromium', channel: 'chrome' }
    },
    {
      name: 'desktop-chromium',
      testMatch: /desktop\.spec\.js/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }
    }
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120000
  }
});

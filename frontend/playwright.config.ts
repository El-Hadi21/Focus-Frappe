import { defineConfig, devices } from '@playwright/test';
import { testUrl } from './e2e/e2e.config';

const isDockerE2E = Boolean(process.env['E2E_BASE_URL']);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env['CI'] ? 1 : 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: testUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: isDockerE2E
    ? undefined
    : [
        {
          command: 'npm run start:e2e --prefix ../backend',
          url: 'http://localhost:3000/api/health',
          reuseExistingServer: !process.env['CI'],
          timeout: 60_000,
        },
        {
          command: 'npm run start',
          url: 'http://localhost:4200',
          reuseExistingServer: !process.env['CI'],
          timeout: 120_000,
        },
      ],
});
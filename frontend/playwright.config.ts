import { PlaywrightTestConfig, devices } from '@playwright/test';
import { testUrl } from './e2e/e2e.config';

const isDockerE2E = Boolean(process.env['E2E_BASE_URL']);

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }],
  ],
  outputDir: './test-results',
  webServer: isDockerE2E
    ? undefined
    : [
        {
          command: 'npm run start:e2e --prefix ../backend',
          url: 'http://localhost:3000/api/status',
          reuseExistingServer: !process.env['CI'],
          timeout: 60_000,
        },
        {
          command: 'npm run start',
          url: testUrl,
          reuseExistingServer: !process.env['CI'],
          timeout: 120_000,
        },
      ],
  use: {
    baseURL: testUrl,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};

export default config;
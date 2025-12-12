import { defineConfig } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './tests' }),
  testDir: './tests',
  outputDir: '../../../test-results/e2e',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  reporter: [
    ['html', { outputFolder: '../../../test-results/e2e-report' }],
    ['list'],
  ],
  webServer: {
    command: 'npx nx serve web',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
    cwd: '../../..',
  },
});

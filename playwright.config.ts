import { defineConfig } from '@playwright/test';
process.env.AIRL_LIVE_DB_PATH ||= `/tmp/airl-browser-${process.pid}.sqlite`;
export default defineConfig({
  testDir: './tests/browser', workers: 1, timeout: 180_000,
  use: { baseURL: 'http://127.0.0.1:3100', channel: 'chrome', headless: true, screenshot: 'only-on-failure' },
  outputDir: '/tmp/airl-playwright-results',
  webServer: { command: 'npm run build && npm run start -- --port 3100', url: 'http://127.0.0.1:3100', reuseExistingServer: false, timeout: 90_000 },
});

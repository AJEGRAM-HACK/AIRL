import { test, expect } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';
import { LiveStore } from '../../src/server/live/store';
import { runRoomJob } from '../../src/server/production/room-jobs';

test('Journey requires fresh paid consent and sends the selected hosted provider without inference in acceptance', async ({ browser }) => {
  const path = process.env.AIRL_LIVE_DB_PATH!;
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  try {
    expect((await context.request.post('/api/account', {
      headers: { Origin: 'http://127.0.0.1:3100' },
      data: { action: 'signup', email: 'journey-provider@example.test', name: 'Provider presenter', password: 'test-password-1234' },
    })).ok()).toBeTruthy();
    const accounts = new PlatformStore(path);
    try { accounts.bootstrapAdmin('journey-provider@example.test'); } finally { accounts.close(); }
    const live = new LiveStore(path);
    try {
      if (live.snapshot().status === 'closed') {
        const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
        live.nextRound(token, live.snapshot().roundId);
      }
    } finally { live.dispose(); }
    const page = await context.newPage();
    // Catalog and close are explicitly intercepted: no hosted request reaches the server.
    await page.route('**/api/models', route => route.fulfill({ json: {
      hostedConfigured: true, hosted: ['acceptance-hosted-model', 'acceptance-other-model'], ollama: ['qwen3:4b-instruct'],
    } }));
    let sent: unknown;
    await page.route('**/api/live/rooms/barangay-2099/close', async route => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 403, json: { error: 'Acceptance intercepted this paid operation.' } });
    });
    await page.goto('/journey?universe=barangay-2099&step=vote');
    await page.getByRole('button', { name: 'Join room to vote', exact: true }).click();
    await page.getByRole('button', { name: 'Set up OpenAI production', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(dialog.getByLabel('Production provider', { exact: true })).toHaveValue('hosted_openai');
    await expect(dialog.getByLabel('Production model', { exact: true })).toHaveValue('acceptance-hosted-model');
    await expect(dialog.getByText('Session OpenAI key · paid', { exact: true })).toHaveCount(0);
    const consent = dialog.getByRole('checkbox', { name: 'I authorize this paid operation.' });
    await expect(consent).not.toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await consent.check();
    await dialog.getByLabel('Production model', { exact: true }).selectOption('acceptance-other-model');
    await expect(consent).not.toBeChecked();
    await consent.check();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Close voting & produce', exact: true }).click();
    await expect.poll(() => sent).toMatchObject({ provider: {
      mode: 'hosted_openai', model: 'acceptance-other-model', consent: true,
    } });
    await expect(page.locator('main').getByRole('alert')).toContainText('Acceptance intercepted');
    await page.getByRole('button', { name: 'Set up OpenAI production', exact: true }).click();
    await expect(consent).not.toBeChecked();
    await consent.check();
    const external = new LiveStore(path);
    try {
      const token = external.redeemOperatorCode(external.join(), external.issueOperatorCode());
      external.closeRound(token, external.snapshot().roundId, { mode: 'demo' });
      await runRoomJob(path);
      external.nextRound(token, external.snapshot().roundId);
    } finally { external.dispose(); }
    await expect(consent).not.toBeChecked();
    expect(JSON.stringify(sent)).not.toContain('apiKey');
  } finally { await context.close(); }
});

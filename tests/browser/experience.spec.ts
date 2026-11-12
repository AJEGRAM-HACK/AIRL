import { test, expect, type Page } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';
import { LiveStore } from '../../src/server/live/store';

const origin = 'http://127.0.0.1:3100';
async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

const sizes = [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }];

test('hackathon screens reuse real voting, production, playback and creator flows across devices', async ({ browser }) => {
  const guest = await browser.newContext({ viewport: sizes[1], reducedMotion: 'reduce', colorScheme: 'dark' });
  const admin = await browser.newContext({ viewport: sizes[2], reducedMotion: 'reduce', colorScheme: 'dark' });
  const creator = await browser.newContext({ viewport: sizes[2], reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await guest.newPage(), operator = await admin.newPage(), studio = await creator.newPage();
  const errors: string[] = [];
  for (const view of [page, operator, studio]) view.on('pageerror', error => errors.push(error.message));
  try {
    for (const [context, role] of [[admin, 'admin'], [creator, 'creator']] as const) {
      const response = await context.request.post('/api/account', { headers: { Origin: origin }, data: { action: 'signup', email: `experience-${role}@example.test`, name: `Experience ${role}`, password: 'test-password-1234' } });
      expect(response.ok()).toBeTruthy();
    }
    const store = new PlatformStore(process.env.AIRL_LIVE_DB_PATH);
    try { store.bootstrapAdmin('experience-admin@example.test'); } finally { store.close(); }
    const creatorAccount = (await (await creator.request.get('/api/account')).json()).account;
    expect((await admin.request.post('/api/admin', { headers: { Origin: origin }, data: { accountId: creatorAccount.id, role: 'creator' } })).ok()).toBeTruthy();
    const live = new LiveStore(process.env.AIRL_LIVE_DB_PATH);
    try {
      if (live.snapshot().status === 'closed') {
        const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
        live.nextRound(token, live.snapshot().roundId);
      }
    } finally { live.dispose(); }
    for (const size of sizes) {
      await page.setViewportSize(size);
      for (const path of ['/', '/universes', '/universes/barangay-2099', '/live/barangay-2099']) {
        await page.goto(path);
        await expect(page.locator('main h1')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} at ${size.width}`).toBe(true);
      }
    }
    await page.setViewportSize(sizes[2]);
    await page.goto('/');
    await page.getByLabel('Color theme').selectOption('dark');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: '/tmp/airl-experience-01-landing-desktop.png', fullPage: true });
    await page.setViewportSize(sizes[3]);
    await page.reload(); await settle(page);
    await page.screenshot({ path: '/tmp/airl-experience-projector.png', fullPage: true });
    await page.setViewportSize(sizes[1]);
    await page.reload(); await settle(page);
    await page.screenshot({ path: '/tmp/airl-experience-02-landing-mobile.png', fullPage: true });
    await page.goto('/live/barangay-2099');
    const began = Date.now();
    await page.getByRole('button', { name: /Join room to vote/ }).click();
    await page.getByRole('radio', { name: /Declare taho/ }).check();
    await page.getByRole('button', { name: 'Cast my vote', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Vote recorded', exact: true })).toBeVisible();
    await expect(page.locator('.vote-confirmation')).toContainText('Your vote is recorded');
    expect(Date.now() - began).toBeLessThan(15000); // Automated interaction latency, not a human usability claim.
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.reload(); await expect(page.locator('.vote-confirmation')).toBeVisible(); await settle(page);
    await page.locator('.community-panel').screenshot({ path: '/tmp/airl-experience-05-voting-mobile.png' });
    await operator.goto('/studio/barangay-2099');
    await operator.getByRole('button', { name: /Join room to vote/ }).click();
    await operator.getByText('Production settings', { exact: true }).click();
    await operator.locator('.operator-controls').getByLabel('Production provider', { exact: true }).selectOption('demo');
    await operator.getByRole('button', { name: 'Close voting & produce', exact: true }).click();
    await expect(operator.getByRole('button', { name: 'Approve & publish', exact: true })).toBeVisible({ timeout: 15000 });
    await expect(operator.locator('.production-stages [data-state=complete]')).toHaveCount(4);
    await settle(operator);
    await operator.locator('.production-progress').screenshot({ path: '/tmp/airl-experience-06-production-review.png' });
    await operator.getByRole('button', { name: 'Approve & publish', exact: true }).click();
    await expect(page.locator('.episode-meta .eyebrow')).toContainText('demo', { timeout: 15000 });
    const job = (await (await admin.request.get('/api/production?operator=1')).json()).jobs[0];
    const publicJob = (await (await guest.request.get('/api/production')).json()).jobs[0];
    expect(publicJob.events).toEqual([]); expect(publicJob.script).toBeUndefined();
    await page.setViewportSize(sizes[2]);
    await page.goto('/universes');
    await expect(page.locator('.world-card').first()).toBeVisible();
    await settle(page);
    await page.screenshot({ path: '/tmp/airl-experience-03-discovery.png', fullPage: true });
    await page.goto('/universes/barangay-2099');
    await expect(page.getByRole('region', { name: 'Universe story' })).toBeVisible();
    await settle(page);
    await page.screenshot({ path: '/tmp/airl-experience-04-universe.png', fullPage: true });
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto(`/universes/barangay-2099/episodes/${job.run_id}`);
      await expect(page.locator('.episode-stage .remotion-preview')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await studio.setViewportSize(size);
      await studio.goto('/studio');
      await expect(studio.getByRole('button', { name: 'Start from scratch' })).toBeVisible();
      await expect(studio.getByRole('button', { name: 'Generate three pitches' })).not.toBeVisible();
      expect(await studio.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.setViewportSize(sizes[2]);
    await page.reload(); await settle(page);
    await page.getByRole('button', { name: 'Play video', exact: true }).click();
    await expect.poll(async () => Number(await page.locator('.remotion-preview').getAttribute('data-frame'))).toBeGreaterThan(30);
    await page.getByRole('button', { name: 'Pause video', exact: true }).click();
    await page.screenshot({ path: '/tmp/airl-experience-07-episode.png', fullPage: true });
    await studio.setViewportSize(sizes[2]);
    await studio.reload(); await settle(studio);
    await studio.screenshot({ path: '/tmp/airl-experience-08-studio.png', fullPage: true });
    await studio.getByRole('button', { name: 'Generate starting points', exact: true }).click();
    await expect(studio.getByLabel('Production provider', { exact: true })).toBeVisible();
    // The advanced AI surface stays accessible without a provider request.
    expect((await creator.request.get('/studio/ai')).status()).toBe(200);
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('Color theme').selectOption(theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.getByRole('link', { name: /Shape the next chapter/ })).toBeVisible();
    }
    expect(errors).toEqual([]);
  } finally { await guest.close(); await admin.close(); await creator.close(); }
});

test('public timeline uses reported stages and distinguishes running, failed and human-review states', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const job = { id: 'timeline-contract', status: 'running', mode: 'ollama', manifest: null, progress: { stage: 'Screenwriter', status: 'started' } };
  await page.route('**/api/production?universe=barangay-2099', route => route.fulfill({ json: { jobs: [job] } }));
  await page.goto('/live/barangay-2099');
  const progress = page.getByRole('region', { name: 'Episode production' });
  await expect(progress.locator('[data-stage=Screenwriter]')).toHaveAttribute('data-state', 'working');
  await expect(progress.locator('[data-state=complete]')).toHaveCount(0);
  await expect(progress.locator('[data-state=working] svg')).toHaveCSS('animation-name', 'none');
  job.status = 'failed'; job.progress.status = 'failed';
  await page.reload();
  await expect(progress.locator('[data-stage=Screenwriter]')).toHaveAttribute('data-state', 'failed');
  await expect(progress).toContainText('Recorded audience votes are preserved');
  job.status = 'review'; job.progress = { stage: 'Creative Critic', status: 'succeeded' };
  await page.reload();
  await expect(progress.locator('[data-state=complete]')).toHaveCount(4);
  await expect(progress).toContainText('A creator reviews the draft');
  await expect(page.getByRole('button', { name: 'Approve & publish', exact: true })).toHaveCount(0);
});

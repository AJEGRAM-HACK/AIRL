import { test, expect } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';
import { LiveStore } from '../../src/server/live/store';
import { RoomJobs, runRoomJob } from '../../src/server/production/room-jobs';

const origin = 'http://127.0.0.1:3100';
test('Explore and Journey share blue themes with accessible spatial scenes and intact chapters', async ({ browser }) => {
  const path = process.env.AIRL_LIVE_DB_PATH!;
  new PlatformStore(path).close();
  const live = new LiveStore(path);
  const jobs = new RoomJobs(path);
  let round: string, episode: string;
  try {
    const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
    if (live.snapshot().status === 'closed') live.nextRound(token, live.snapshot().roundId);
    round = live.snapshot().roundId;
    live.closeRound(token, round, { mode: 'demo' });
    await runRoomJob(path);
    const job = jobs.list('barangay-2099', true)[0];
    jobs.action(job.id, 'publish');
    episode = job.run_id!;
  } finally { live.dispose(); jobs.close(); }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    const signup = await context.request.post(`${origin}/api/account`, { headers: { Origin: origin }, data: { action: 'signup', email: 'spatial-admin@example.test', name: 'Spatial preview', password: 'spatial-preview-password-1234' } });
    expect(signup.ok()).toBeTruthy();
    const store = new PlatformStore(path);
    try { store.bootstrapAdmin('spatial-admin@example.test'); } finally { store.close(); }
    await page.goto(origin);
    const scene = page.locator('.landing-feature .spatial-world');
    await expect(scene).toHaveAttribute('aria-label', '3D illustration of Barangay 2099');
    await expect(scene.locator('.spatial-city')).toHaveCSS('transform-style', 'preserve-3d');
    await expect(page.locator('.landing-feature')).toHaveCSS('opacity', '1');
    const rig = scene.locator('.spatial-rig');
    const bounds = (await scene.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width * .85, bounds.y + bounds.height * .25);
    await expect.poll(() => scene.evaluate(element => element.style.getPropertyValue('--view-x'))).not.toBe('');
    await expect(rig).not.toHaveCSS('transform', 'none');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => scene.evaluate(element => element.style.getPropertyValue('--view-x'))).toBe('');
    await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height * .7);
    expect(await scene.evaluate(element => element.style.getPropertyValue('--view-x'))).toBe('');
    for (const theme of ['dark', 'light']) {
      await page.goto(origin);
      await page.getByLabel('Color theme', { exact: true }).selectOption(theme);
      const sharedBackground = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
      const sharedAccent = await page.locator('body').evaluate(element => getComputedStyle(element).getPropertyValue('--public-accent').trim());
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `/tmp/airl-spatial-explore-${theme}.png`, fullPage: true });
      await page.getByRole('link', { name: /^Launch Journey\b/ }).click();
      await expect(page.locator('.journey-experience')).toHaveCSS('background-color', sharedBackground);
      expect(await page.locator('.journey-experience').evaluate(element => getComputedStyle(element).getPropertyValue('--public-accent').trim())).toBe(sharedAccent);
      await expect(page.getByLabel('Color theme', { exact: true })).toHaveValue(theme);
      for (const size of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
        await page.setViewportSize(size);
        for (const step of ['world', 'vote', 'production', 'premiere']) {
          await page.goto(`${origin}/journey?universe=barangay-2099&round=${round}&step=${step}${step === 'premiere' ? `&episode=${episode}` : ''}`);
          await expect(page.locator('main h1')).toBeVisible();
          await expect(page.locator('[data-testid=journey-live-status]')).not.toContainText('Loading');
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} ${step} at ${size.width}`).toBe(true);
          await expect(page.getByLabel('Color theme', { exact: true })).toBeInViewport();
          await expect(page.getByRole('button', { name: 'Next chapter', exact: true })).toBeInViewport();
          if (step === 'premiere') await expect(page.locator('.journey-film .remotion-preview')).toBeVisible();
          if (size.width === 1440) {
            await page.evaluate(() => document.fonts.ready);
            await page.screenshot({ path: `/tmp/airl-spatial-journey-${theme}-${step}.png` });
          }
          if (size.width === 390 && step === 'world') await page.screenshot({ path: `/tmp/airl-spatial-journey-${theme}-mobile.png` });
        }
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${origin}/journey?universe=barangay-2099&round=${round}`);
      await page.getByRole('button', { name: 'Meet the cast', exact: true }).click();
      const sheet = page.getByRole('dialog', { name: 'Meet the cast', exact: true });
      await expect(sheet).toBeVisible();
      await expect(sheet).toHaveCSS('color', await page.locator('body').evaluate(element => getComputedStyle(element).color));
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: 'Meet the cast', exact: true })).toBeFocused();
      await page.getByRole('link', { name: 'Exit to Explore', exact: true }).click();
      await expect(page.getByLabel('Color theme', { exact: true })).toHaveValue(theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    }
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});

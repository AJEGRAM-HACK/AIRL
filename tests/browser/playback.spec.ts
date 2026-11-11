import { test, expect } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';
import { LiveStore } from '../../src/server/live/store';
import { RoomJobs, runRoomJob } from '../../src/server/production/room-jobs';

declare global { interface Window { blockAudioResume: boolean; blockedAudioResumes: number } }

test('silent episodes replay after seeking when browser audio resume never settles', async ({ browser }) => {
  const path = process.env.AIRL_LIVE_DB_PATH!;
  new PlatformStore(path).close();
  const live = new LiveStore(path);
  const jobs = new RoomJobs(path);
  try {
    const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
    if (live.snapshot().status === 'closed') live.nextRound(token, live.snapshot().roundId);
    live.closeRound(token, live.snapshot().roundId, { mode: 'demo' });
    await runRoomJob(path);
    jobs.action(jobs.list('barangay-2099', true)[0].id, 'publish');
  } finally { live.dispose(); jobs.close(); }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await context.addInitScript(() => {
      const state = window;
      state.blockAudioResume = false;
      state.blockedAudioResumes = 0;
      const resume = AudioContext.prototype.resume;
      AudioContext.prototype.resume = function () {
        if (state.blockAudioResume) {
          state.blockedAudioResumes++;
          return new Promise<void>(() => {});
        }
        return resume.call(this);
      };
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/live/barangay-2099');
    const preview = page.locator('.episode-gallery .remotion-preview');
    await expect(preview).toBeVisible();
    await preview.getByRole('button', { name: 'Play video', exact: true }).tap();
    await expect.poll(async () => Number(await preview.getAttribute('data-frame'))).toBeGreaterThan(20);
    await preview.getByRole('button', { name: 'Pause video', exact: true }).tap();
    await page.evaluate(() => { window.blockAudioResume = true; });
    for (const target of [0, 180, 0]) {
      await preview.getByRole('slider', { name: 'Seek episode' }).fill(String(target));
      await expect(preview).toHaveAttribute('data-frame', String(target));
      await preview.getByRole('button', { name: 'Play video', exact: true }).tap();
      await expect.poll(async () => Number(await preview.getAttribute('data-frame'))).toBeGreaterThan(target + 15);
      await preview.getByRole('button', { name: 'Pause video', exact: true }).tap();
    }
    expect(await page.evaluate(() => window.blockedAudioResumes)).toBe(0);
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});

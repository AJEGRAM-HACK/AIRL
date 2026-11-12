import { test, expect } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';
import { LiveStore } from '../../src/server/live/store';
import { RoomJobs, runRoomJob } from '../../src/server/production/room-jobs';

test('published audio plays, pauses, seeks and replays on mobile, and creators open the next vote from editable suggestions', async ({ browser }) => {
  const path = process.env.AIRL_LIVE_DB_PATH!;
  const store = new PlatformStore(path);
  const live = new LiveStore(path);
  const jobs = new RoomJobs(path);
  let episodeId = '';
  let privateWorld = '';
  let draftJob = '';
  try {
    const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
    if (live.snapshot().status === 'closed') live.nextRound(token, live.snapshot().roundId);
    live.closeRound(token, live.snapshot().roundId, { mode: 'demo' });
    await runRoomJob(path);
    const job = jobs.list('barangay-2099', true)[0];
    jobs.action(job.id, 'publish');
    episodeId = job.run_id!;
    const ownerToken = store.signup('audio-private-owner@example.test', 'Owner', 'test-password-1234');
    store.bootstrapAdmin('audio-private-owner@example.test');
    const owner = store.requireAccount(ownerToken);
    privateWorld = store.create(owner, { title: 'Private audio', characters: [{ id: 'guide', name: 'Guide' }] }).id;
    const privateLive = new LiveStore(path, privateWorld);
    try { privateLive.closeRound(ownerToken, privateLive.snapshot().roundId, { mode: 'demo' }); } finally { privateLive.dispose(); }
    await runRoomJob(path);
    draftJob = jobs.list(privateWorld, true)[0].id;
  } finally { jobs.close(); live.dispose(); store.close(); }

  const participant = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const admin = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  try {
    const page = await participant.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    expect((await participant.request.get(`/api/universes/${privateWorld}/audio?jobId=${draftJob}`)).status()).toBe(404);
    expect((await participant.request.get(`/api/universes/barangay-2099/audio?episodeId=${crypto.randomUUID()}`)).status()).toBe(404);
    expect((await participant.request.get('/studio')).status()).toBe(404);
    await page.goto(`/universes/barangay-2099/episodes/${episodeId}`);
    const preview = page.locator('.remotion-preview');
    await expect(preview).toHaveAttribute('data-audio', 'ready');
    const audio = preview.locator('audio');
    await expect(audio).toHaveCount(1);
    expect(await audio.evaluate((element: HTMLAudioElement) => ({ muted: element.muted, volume: element.volume }))).toEqual({ muted: false, volume: 1 });
    await preview.getByRole('button', { name: 'Play video', exact: true }).tap();
    await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0.4);
    await preview.getByRole('button', { name: 'Pause video', exact: true }).tap();
    await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
    for (const target of [180, 0, 360, 0]) {
      await preview.getByRole('slider', { name: 'Seek episode', exact: true }).fill(String(target));
      await preview.getByRole('button', { name: 'Play video', exact: true }).tap();
      await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(target / 30 + 0.2);
      expect(await audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeLessThan(target / 30 + 2);
      await preview.getByRole('button', { name: 'Pause video', exact: true }).tap();
    }
    await preview.getByRole('checkbox', { name: 'Captions', exact: true }).uncheck();
    await expect(preview.getByRole('checkbox', { name: 'Captions', exact: true })).not.toBeChecked();
    expect(errors).toEqual([]);

    const origin = 'http://127.0.0.1:3100';
    expect((await admin.request.post('/api/account', { headers: { Origin: origin }, data: {
      action: 'signup', email: 'episode-audio-admin@example.test', name: 'Admin', password: 'test-password-1234',
    } })).ok()).toBeTruthy();
    const accounts = new PlatformStore(path);
    try { accounts.bootstrapAdmin('episode-audio-admin@example.test'); } finally { accounts.close(); }
    const draftAudio = await admin.request.get(`/api/universes/${privateWorld}/audio?jobId=${draftJob}`);
    expect(draftAudio.ok()).toBeTruthy();
    expect(draftAudio.headers()['content-type']).toContain('audio/wav');
    expect((await admin.request.post('/api/production', { headers: { Origin: origin }, data: { jobId: draftJob, action: 'publish' } })).ok()).toBeTruthy();
    expect((await admin.request.patch(`/api/universes/${privateWorld}`, { headers: { Origin: origin }, data: { visibility: 'public' } })).ok()).toBeTruthy();
    const studio = await admin.newPage();
    await studio.goto(`/studio/${privateWorld}`);
    const suggestions = studio.getByRole('region', { name: 'Next episode suggestions', exact: true });
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Suggestion settings', { exact: true }).click();
    await suggestions.getByLabel('Suggestion provider', { exact: true }).selectOption('demo');
    await suggestions.getByRole('button', { name: 'Generate next-episode suggestions', exact: true }).click();
    await expect(suggestions.getByLabel('Direction 1 title', { exact: true })).toBeVisible();
    await expect(suggestions).toContainText('Demo suggestions');
    await suggestions.getByLabel('Direction 1 title', { exact: true }).fill('Let the neighborhood choose the next performance');
    await suggestions.getByRole('button', { name: 'Open voting with these suggestions', exact: true }).click();
    await page.goto(`/live/${privateWorld}`);
    await expect(page.getByRole('radio', { name: /Let the neighborhood choose the next performance/ })).toBeVisible();
    expect((await participant.request.post('/api/universes/barangay-2099/suggestions', { headers: { Origin: origin }, data: { episodeId, provider: { mode: 'demo' } } })).status()).toBe(401);
    await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await studio.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => studio.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally { await participant.close(); await admin.close(); }
});

test('legacy room operators retain next-round controls while generation stays with authorized accounts', async ({ browser }) => {
  const path = process.env.AIRL_LIVE_DB_PATH!;
  const live = new LiveStore(path);
  let code = '';
  try {
    const operator = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
    if (live.snapshot().status === 'open') live.closeRound(operator, live.snapshot().roundId, { mode: 'demo' });
    code = live.issueOperatorCode();
  } finally { live.dispose(); }
  await runRoomJob(path);
  const context = await browser.newContext();
  try {
    const headers = { Origin: 'http://127.0.0.1:3100' };
    expect((await context.request.post('/api/live/session', { headers, data: {} })).ok()).toBeTruthy();
    expect((await context.request.post('/api/live/operator', { headers, data: { code } })).ok()).toBeTruthy();
    const page = await context.newPage();
    await page.goto('/studio/barangay-2099');
    await expect(page.getByRole('region', { name: 'Next episode suggestions', exact: true })).toHaveCount(0);
    const next = page.getByRole('button', { name: 'Start next round', exact: true });
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.locator('.vote-status')).toContainText('Voting open');
  } finally { await context.close(); }
});

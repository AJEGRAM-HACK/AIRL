import { test, expect } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';
import { LiveStore } from '../../src/server/live/store';
import { RoomJobs, runRoomJob } from '../../src/server/production/room-jobs';

test('Journey preserves a real production across modes and premieres a saved episode independently', async ({ browser }) => {
  const path = process.env.AIRL_LIVE_DB_PATH!;
  new PlatformStore(path).close();
  const live = new LiveStore(path);
  const jobs = new RoomJobs(path);
  let savedEpisode: string;
  let round: string;
  try {
    const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
    if (live.snapshot().status === 'closed') live.nextRound(token, live.snapshot().roundId);
    live.closeRound(token, live.snapshot().roundId, { mode: 'demo' });
    await runRoomJob(path);
    const saved = jobs.list('barangay-2099', true)[0];
    jobs.action(saved.id, 'publish');
    savedEpisode = saved.run_id!;
    live.nextRound(token, live.snapshot().roundId);
    round = live.snapshot().roundId;
  } finally { live.dispose(); jobs.close(); }

  const presenter = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const audienceA = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const audienceB = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await presenter.newPage();
  const a = await audienceA.newPage(), b = await audienceB.newPage();
  const errors: string[] = [];
  for (const view of [page, a, b]) view.on('pageerror', error => errors.push(error.message));
  try {
    const signup = await presenter.request.post('/api/account', { headers: { Origin: 'http://127.0.0.1:3100' }, data: { action: 'signup', email: 'journey-admin@example.test', name: 'Journey presenter', password: 'test-password-1234' } });
    expect(signup.ok()).toBeTruthy();
    const accounts = new PlatformStore(path);
    try { accounts.bootstrapAdmin('journey-admin@example.test'); } finally { accounts.close(); }
    await page.goto(`/journey?universe=barangay-2099&round=${round}`);
    await expect(page.getByRole('heading', { name: 'Enter the world', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Open the voting stage' }).click();
    await expect(page.locator('.room-join')).toContainText('public tunnel or HTTPS LAN demo address');
    expect((await presenter.request.get('/api/live/rooms/barangay-2099/join-qr')).headers()['content-type']).toBe('image/png');
    for (const view of [a, b]) {
      await view.goto('/live/barangay-2099');
      await view.getByRole('button', { name: /Join room to vote/ }).click();
      await view.getByRole('radio', { name: /Launch a mandatory karaoke/ }).check();
      await view.getByRole('button', { name: 'Cast my vote' }).click();
      await expect(view.getByRole('button', { name: 'Vote recorded' })).toBeVisible();
    }
    await expect(page.locator('.community-stats')).toContainText('2 votes');
    await page.getByRole('button', { name: /Join room to vote/ }).click();
    await page.getByRole('button', { name: 'Close voting & produce', exact: true }).click();
    await expect(page.locator('.journey-winner')).toContainText('karaoke');
    await page.getByRole('button', { name: 'Follow the production' }).click();
    await expect(page.getByRole('heading', { name: 'Watch the episode take shape', exact: true })).toBeVisible();
    await expect(page.locator('.journey-agents')).toContainText('Story Director');
    const first = await (await presenter.request.get('/api/production?operator=1')).json();
    const jobId = first.jobs[0].id;
    expect(first.jobs[0].mode).toBe('ollama');
    expect(first.jobs[0].model).toBe('qwen3:4b-instruct');
    expect(first.jobs[0].round_id).toBe(round);
    expect(['queued', 'running']).toContain(first.jobs[0].status);

    await page.getByRole('link', { name: 'Explore mode', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/platform\\?.*round=${round}`));
    await expect(page.getByRole('link', { name: 'Journey mode', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Journey mode', exact: true }).click();
    await page.reload();
    await expect(page.getByTestId('journey-live-status')).toContainText('ollama');
    const privateDuringRun = await (await audienceA.request.get('/api/production')).json();
    expect(privateDuringRun.jobs[0].manifest).toBeNull();
    expect(privateDuringRun.jobs[0].script).toBeUndefined();
    expect(privateDuringRun.jobs[0].events).toEqual([]);

    await page.getByLabel('Approved saved episode', { exact: true }).selectOption(savedEpisode);
    const mutations: string[] = [];
    page.on('request', request => { if (request.method() === 'POST') mutations.push(request.url()); });
    await page.getByRole('button', { name: 'Play a saved episode', exact: true }).click();
    await expect(page.getByText('Pre-generated rehearsal episode', { exact: true })).toBeVisible();
    const preview = page.locator('.journey-premiere .remotion-preview');
    await preview.getByRole('button', { name: 'Play video', exact: true }).click();
    await expect.poll(async () => Number(await preview.getAttribute('data-frame'))).toBeGreaterThan(15);
    await preview.getByRole('button', { name: 'Pause video', exact: true }).click();
    await page.reload();
    await expect(page.getByText('Pre-generated rehearsal episode', { exact: true })).toBeVisible();
    expect(mutations).toEqual([]);
    const resumed = await (await presenter.request.get('/api/production?operator=1')).json();
    expect(resumed.jobs[0].id).toBe(jobId);
    expect(resumed.jobs[0].round_id).toBe(round);
    expect(resumed.jobs[0].attempts).toBe(1);

    let result: any;
    let earlyPreview = false;
    await expect.poll(async () => {
      result = (await (await presenter.request.get('/api/production?operator=1')).json()).jobs.find((job: any) => job.id === jobId);
      if (result.status === 'running' && result.manifest && result.previewVersion && !result.events.some((event: any) => event.stage === 'Creative Critic' && event.status === 'succeeded')) earlyPreview = true;
      return result.status;
    }, { timeout: 130000, intervals: [250] }).toBe('review');
    expect(result.choice).toMatch(/karaoke/i);
    expect(result.events.filter((event: any) => event.status === 'succeeded').map((event: any) => event.stage)).toEqual(expect.arrayContaining(['Story Director', 'Screenwriter', 'Visual Producer', 'Creative Critic']));
    expect(earlyPreview).toBeTruthy();
    console.log('Journey real Ollama job', JSON.stringify({ jobId, earlyPreview, stages: result.events.length }));
    await page.getByRole('link', { name: 'Watch the episode take shape', exact: true }).click();
    await page.getByRole('button', { name: 'Review before the premiere' }).click();
    await expect(page.getByRole('heading', { name: 'Proposed canon changes' })).toBeVisible();
    await page.getByRole('button', { name: 'Approve & publish', exact: true }).click();
    await expect(page.locator('.journey-premiere')).toContainText(result.manifest.title);
    await expect(page.getByRole('link', { name: 'Audience watch link', exact: true })).toHaveAttribute('href', `/universes/barangay-2099/episodes/${result.run_id}`);
    for (const view of [a, b]) await expect(view.locator('.episode-gallery')).toContainText(result.manifest.title, { timeout: 15000 });
    const livePreview = page.locator('.journey-premiere .remotion-preview');
    for (const target of [0, 180, 0]) {
      await livePreview.getByRole('slider', { name: 'Seek episode' }).fill(String(target));
      await livePreview.getByRole('button', { name: 'Play video', exact: true }).click();
      await expect.poll(async () => Number(await livePreview.getAttribute('data-frame'))).toBeGreaterThan(target + 10);
      await livePreview.getByRole('button', { name: 'Pause video', exact: true }).click();
    }
    await livePreview.getByRole('checkbox', { name: 'Captions', exact: true }).uncheck();
    await livePreview.getByRole('checkbox', { name: 'Captions', exact: true }).check();
    await livePreview.getByText('Episode transcript', { exact: true }).click();
    await expect(livePreview.locator('details')).toHaveAttribute('open', '');
    await page.getByRole('button', { name: 'Ask about this episode', exact: true }).click();
    await expect(page.getByLabel('Source scope')).toHaveValue('episode');
    await page.getByLabel('Your question').fill('What did Tita Nena say in this episode?');
    await page.getByRole('button', { name: 'Ask the story', exact: true }).click();
    const citations = page.locator('.story-helper [role=status] a');
    await expect(citations.first()).toBeVisible({ timeout: 110000 });
    expect(await citations.first().getAttribute('href')).toContain(`/episodes/${result.run_id}`);
    await expect(page.locator('.story-helper [role=status]')).toContainText('Scene');
    console.log('Journey story answer', await page.locator('.story-helper [role=status]').innerText());
    await citations.first().click();
    await expect(page).toHaveURL(new RegExp(`/episodes/${result.run_id}.*scene-`));
    await page.getByRole('link', { name: 'Explore mode', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`round=${round}.*episode=${result.run_id}`));
    await page.getByRole('link', { name: 'Journey mode', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`round=${round}.*episode=${result.run_id}`));
    expect(errors).toEqual([]);
  } finally { await presenter.close(); await audienceA.close(); await audienceB.close(); }
});

test('Journey scopes custom universes and hides draft controls from guests', async ({ browser }) => {
  const store = new PlatformStore(process.env.AIRL_LIVE_DB_PATH);
  const token = store.signup('journey-owner@example.test', 'World owner', 'test-password-1234');
  store.bootstrapAdmin('journey-owner@example.test');
  const world = store.create(store.account(token)!, { title: 'Journey Observatory', settings: { premise: 'A missing star map divides the crew.' }, characters: [{ id: 'guide', name: 'Guide', role: 'Navigator' }] });
  store.update(store.account(token)!, world.id, { visibility: 'public' });
  store.close();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    await page.goto(`/journey?universe=${world.id}&step=production`);
    await expect(page.getByRole('button', { name: 'Approve & publish', exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Presentation universe')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Play a saved episode', exact: true })).toBeDisabled();
    await page.getByRole('link', { name: 'Enter the world', exact: true }).click();
    await expect(page.getByText('A missing star map divides the crew.', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Explore mode', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`universe=${world.id}`));
    await expect(page.getByRole('heading', { name: 'Journey Observatory', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Journey mode', exact: true }).click();
    await page.getByRole('button', { name: 'Open the voting stage' }).click();
    await expect(page.locator('.room-join img')).toHaveCount(0);
    await expect(page.locator('.room-join')).toContainText('public tunnel or HTTPS LAN demo address');
    await expect(page.getByRole('button', { name: 'Close voting & produce', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const missing = await page.goto('/journey?universe=unknown-world');
    expect(missing?.status()).toBe(404);
  } finally { await context.close(); }
});

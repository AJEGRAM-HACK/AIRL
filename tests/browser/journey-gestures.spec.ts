import { test, expect, type CDPSession, type Page } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';
import { LiveStore } from '../../src/server/live/store';
import { RoomJobs, runRoomJob } from '../../src/server/production/room-jobs';

const origin = 'http://127.0.0.1:3100';
async function storedEpisode() {
  const path = process.env.AIRL_LIVE_DB_PATH!;
  new PlatformStore(path).close();
  const live = new LiveStore(path), jobs = new RoomJobs(path);
  try {
    const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
    if (live.snapshot().status === 'closed') live.nextRound(token, live.snapshot().roundId);
    const round = live.snapshot().roundId;
    live.closeRound(token, round, { mode: 'demo' });
    await runRoomJob(path);
    const job = jobs.list('barangay-2099', true)[0];
    jobs.action(job.id, 'publish');
    return { round, episode: job.run_id! };
  } finally { live.dispose(); jobs.close(); }
}
function chapterUrl(context: { round: string; episode: string }, step = 'world') {
  return `${origin}/journey?universe=barangay-2099&round=${context.round}&episode=${context.episode}&saved=1&step=${step}`;
}
async function quiet(page: Page) {
  await expect(page.locator('.journey-experience')).toHaveAttribute('data-transition', 'idle');
}
async function swipe(cdp: CDPSession, x: number, y: number, dx: number, dy: number) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let frame = 1; frame <= 7; frame++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * frame / 7, y: y + dy * frame / 7 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

test('wheel navigation animates one chapter per gesture and preserves controls and URL context', async ({ page }) => {
  const context = await storedEpisode();
  const posts: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(chapterUrl(context));
  await quiet(page);
  const stage = page.locator('.journey-stage'), root = page.locator('.journey-experience');
  await page.mouse.move(350, 300);
  await page.mouse.wheel(0, 12);
  expect(new URL(page.url()).searchParams.get('step')).toBe('world');
  await page.mouse.wheel(0, 140);
  await expect(root).toHaveAttribute('data-transition', 'out');
  await expect(stage).toHaveAttribute('aria-busy', 'true');
  await page.waitForTimeout(180); // Sample the actual outgoing 380 ms animation.
  await page.screenshot({ path: '/tmp/airl-gesture-out.png' });
  for (let frame = 0; frame < 8; frame++) await page.mouse.wheel(0, 40);
  await expect(page).toHaveURL(/step=vote/);
  await page.screenshot({ path: '/tmp/airl-gesture-in.png' });
  await quiet(page);
  expect(new URL(page.url()).searchParams.get('step')).toBe('vote');
  for (const [key, value] of Object.entries({ universe: 'barangay-2099', round: context.round, episode: context.episode, saved: '1' })) expect(new URL(page.url()).searchParams.get(key)).toBe(value);
  await expect(stage).toBeFocused();
  await page.mouse.move(350, 300);
  await page.mouse.wheel(0, -140);
  await expect(page).toHaveURL(/step=world/);
  await quiet(page);
  await page.mouse.wheel(0, -140);
  expect(new URL(page.url()).searchParams.get('step')).toBe('world');
  await page.getByRole('button', { name: 'Meet the cast', exact: true }).click();
  await page.locator('.journey-sheet-body').hover();
  await page.mouse.wheel(0, 300);
  expect(new URL(page.url()).searchParams.get('step')).toBe('world');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Meet the cast', exact: true })).toBeFocused();
  await page.goto(chapterUrl(context, 'premiere'));
  await quiet(page);
  await page.getByRole('slider', { name: 'Seek episode', exact: true }).hover();
  await page.mouse.wheel(0, 160);
  expect(new URL(page.url()).searchParams.get('step')).toBe('premiere');
  await page.getByRole('button', { name: 'Play video', exact: true }).click();
  await expect.poll(async () => Number(await page.locator('.journey-film .remotion-preview').getAttribute('data-frame'))).toBeGreaterThan(15);
  await page.getByRole('button', { name: 'Pause video', exact: true }).click();
  expect(posts).toEqual([]); // Navigation alone never joins/closes a vote or requests generation.
});

test('native phone swipes change chapters while long content, forms and playback keep their gestures', async ({ browser }) => {
  const story = await storedEpisode();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage(), cdp = await context.newCDPSession(page);
  try {
    const account = await context.request.post(`${origin}/api/account`, { headers: { Origin: origin }, data: { action: 'signup', email: 'gesture-viewer@example.test', name: 'Gesture viewer', password: 'gesture-viewer-password-1234' } });
    expect(account.ok()).toBeTruthy();
    await page.goto(chapterUrl(story, 'vote'));
    await quiet(page);
    const stage = page.locator('.journey-stage');
    const bounds = (await stage.boundingBox())!;
    expect(await stage.evaluate(element => element.scrollHeight - element.clientHeight)).toBeGreaterThan(50);
    await swipe(cdp, 220, bounds.y + bounds.height * .7, 0, -150);
    await expect.poll(() => stage.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    expect(new URL(page.url()).searchParams.get('step')).toBe('vote');
    await stage.evaluate(element => { element.scrollTop = element.scrollHeight; });
    await swipe(cdp, 220, bounds.y + bounds.height * .7, 0, -140);
    await expect(page).toHaveURL(/step=production/);
    await quiet(page);
    await expect(page.locator('.journey-chapter')).toHaveCSS('animation-name', 'none');
    await expect(stage).toBeFocused();
    await page.waitForTimeout(350); // Distinct gesture after the reduced-motion debounce.
    const production = (await stage.boundingBox())!;
    await swipe(cdp, 300, production.y + 60, -170, 0);
    await expect(page).toHaveURL(/step=premiere/);
    await quiet(page);
    await page.waitForTimeout(350);
    const film = (await page.locator('.journey-film .remotion-preview').boundingBox())!;
    await swipe(cdp, film.x + film.width * .8, film.y + film.height * .4, -film.width * .6, 0);
    expect(new URL(page.url()).searchParams.get('step')).toBe('premiere');
    const premiere = (await stage.boundingBox())!;
    await swipe(cdp, 70, premiere.y + 28, 200, 0);
    await expect(page).toHaveURL(/step=production/);
    await quiet(page);
    await page.waitForTimeout(350);
    await stage.evaluate(element => { element.scrollTop = 0; });
    await swipe(cdp, 220, production.y + 65, 0, 130);
    await expect(page).toHaveURL(/step=vote/);
    await page.goto(chapterUrl(story, 'ask'));
    await quiet(page);
    const question = page.getByRole('textbox', { name: 'Your question', exact: true });
    await question.fill('What did the audience choose?');
    await question.scrollIntoViewIfNeeded();
    const field = (await question.boundingBox())!;
    await swipe(cdp, field.x + field.width * .2, field.y + field.height * .5, field.width * .6, 0);
    expect(new URL(page.url()).searchParams.get('step')).toBe('ask');
    await expect(question).toHaveValue('What did the audience choose?');
    await stage.evaluate(element => { element.scrollTop = element.scrollHeight; });
    await swipe(cdp, 8, bounds.y + bounds.height * .7, 0, -140);
    expect(new URL(page.url()).searchParams.get('step')).toBe('ask');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

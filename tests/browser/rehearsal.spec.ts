import { test, expect } from '@playwright/test';
import { LiveStore } from '../../src/server/live/store';
import { PlatformStore } from '../../src/server/platform/store';
import { RoomJobs, runRoomJob } from '../../src/server/production/room-jobs';

const origin = 'http://127.0.0.1:3100';

function openRound() {
  const live = new LiveStore(process.env.AIRL_LIVE_DB_PATH);
  try {
    const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
    if (live.snapshot().status === 'closed') live.nextRound(token, live.snapshot().roundId);
    return live.snapshot();
  } finally {
    live.dispose();
  }
}

test('a keyboard participant joins and votes with stable choice names as results update', async ({ browser }) => {
  const round = openRound();
  const participant = await browser.newContext({ reducedMotion: 'reduce' });
  const otherParticipant = await browser.newContext();
  try {
    const page = await participant.newPage();
    await page.goto('/live/barangay-2099');
    const panel = page.getByRole('region', { name: 'Community vote', exact: true });
    const join = panel.getByRole('button', { name: /Join room to vote/ });
    await expect(join).toBeVisible();
    const began = Date.now();
    await join.focus();
    await page.keyboard.press('Enter');
    const first = panel.getByRole('radio', { name: round.options[0].title, exact: true });
    await expect(first).toBeFocused();
    await expect(first).not.toBeChecked();
    await expect(first).toHaveAccessibleDescription(
      `${round.options[0].description} 0 votes · 0%`,
    );
    await page.keyboard.press('Space');
    await expect(first).toBeChecked();

    expect((await otherParticipant.request.post('/api/live/session', {
      headers: { Origin: origin }, data: { universe: 'barangay-2099' },
    })).ok()).toBeTruthy();
    expect((await otherParticipant.request.post('/api/live/rooms/barangay-2099/vote', {
      headers: { Origin: origin },
      data: { roundId: round.roundId, optionId: round.options[0].id },
    })).ok()).toBeTruthy();
    await expect(panel.locator('.community-stats')).toContainText('1 votes');
    await expect(first).toHaveAccessibleName(round.options[0].title);
    await expect(first).toHaveAccessibleDescription(
      `${round.options[0].description} 1 votes · 100%`,
    );
    await page.keyboard.press('Tab');
    await expect(panel.getByRole('button', { name: 'Cast my vote', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(panel.locator('.vote-confirmation')).toContainText(round.options[0].title);
    await expect(panel.getByRole('button', { name: 'Vote recorded', exact: true })).toBeVisible();
    console.log('Automated keyboard vote milliseconds', Date.now() - began);
    await expect(panel.locator('.community-stats')).toContainText('2 votes');
    await page.reload();
    await expect(panel.locator('.vote-confirmation')).toBeVisible();
    await expect(first).not.toBeFocused();
  } finally {
    await participant.close();
    await otherParticipant.close();
  }
});

test('rehearsal pages have descriptive titles and private world metadata stays protected', async ({ browser }) => {
  const admin = await browser.newContext();
  const guest = await browser.newContext();
  try {
    expect((await admin.request.post('/api/account', {
      headers: { Origin: origin },
      data: { action: 'signup', email: 'rehearsal-admin@example.test', name: 'Rehearsal admin', password: 'test-password-1234' },
    })).ok()).toBeTruthy();
    const accounts = new PlatformStore(process.env.AIRL_LIVE_DB_PATH);
    try { accounts.bootstrapAdmin('rehearsal-admin@example.test'); } finally { accounts.close(); }
    const page = await guest.newPage();
    await page.goto('/');
    const homeTitle = await page.title();
    await page.getByRole('link', { name: 'Explore Universes', exact: true }).click();
    await expect(page).toHaveTitle('Explore universes — AIRL');
    await expect(page.locator('#__next-route-announcer__')).toHaveText('Explore universes — AIRL');
    expect(await page.title()).not.toBe(homeTitle);
    await page.getByRole('link', { name: 'Explore Barangay 2099', exact: true }).click();
    await expect(page).toHaveTitle('Barangay 2099 — AIRL');
    for (const [route, title] of [
      ['/live', 'Live rooms — AIRL'],
      ['/live/barangay-2099', 'Vote in Barangay 2099 — AIRL'],
      ['/account', 'Your account — AIRL'],
      ['/journey?universe=barangay-2099', 'Journey — AIRL'],
      ['/universes/barangay-2099/characters', 'Characters in Barangay 2099 — AIRL'],
      ['/universes/barangay-2099/episodes', 'Episodes in Barangay 2099 — AIRL'],
      ['/universes/barangay-2099/characters/captain-bot', 'Captain Bot — AIRL'],
    ]) {
      await page.goto(route);
      await expect(page).toHaveTitle(title);
    }
    const creatorPage = await admin.newPage();
    for (const [route, title] of [
      ['/studio', 'Creator Studio — AIRL'],
      ['/studio/ai', 'AI settings — AIRL'],
      ['/studio/barangay-2099', 'Episode production — AIRL'],
      ['/studio/worlds/barangay-2099', 'World management — AIRL'],
    ]) {
      await creatorPage.goto(route);
      await expect(creatorPage).toHaveTitle(title);
    }
    const privateResponse = await admin.request.post('/api/universes', {
      headers: { Origin: origin }, data: { title: 'Private rehearsal observatory' },
    });
    expect(privateResponse.ok()).toBeTruthy();
    const privateWorld = (await privateResponse.json()).universe;
    for (const route of [`/universes/${privateWorld.id}`, `/live/${privateWorld.id}`]) {
      const response = await guest.request.get(route);
      expect(response.status()).toBe(404);
      expect(await response.text()).not.toContain('Private rehearsal observatory');
    }
    expect((await guest.request.get('/universes/unknown-rehearsal-world')).status()).toBe(404);

    const round = openRound();
    const live = new LiveStore(process.env.AIRL_LIVE_DB_PATH);
    try {
      const token = live.redeemOperatorCode(live.join(), live.issueOperatorCode());
      live.closeRound(token, round.roundId, { mode: 'demo' });
    } finally { live.dispose(); }
    await runRoomJob(process.env.AIRL_LIVE_DB_PATH!);
    const jobs = new RoomJobs(process.env.AIRL_LIVE_DB_PATH);
    try {
      const job = jobs.list('barangay-2099', true)[0];
      jobs.action(job.id, 'publish');
      await page.goto(`/universes/barangay-2099/episodes/${job.run_id}`);
      await expect(page).toHaveTitle(`${job.manifest!.title} — AIRL`);
    } finally { jobs.close(); }
  } finally {
    await admin.close();
    await guest.close();
  }
});

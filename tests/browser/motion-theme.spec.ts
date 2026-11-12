import { test, expect } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';

const origin = 'http://127.0.0.1:3100';
test('header theme controls remain reachable on phones and motion respects the user preference', async ({ browser }) => {
  const guest = await browser.newContext({ colorScheme: 'dark' });
  const admin = await browser.newContext({ colorScheme: 'dark' });
  const visitor = await guest.newPage(), creator = await admin.newPage();
  const errors: string[] = [];
  for (const page of [visitor, creator]) page.on('pageerror', error => errors.push(error.message));
  try {
    const response = await admin.request.post(`${origin}/api/account`, { headers: { Origin: origin }, data: { action: 'signup', email: 'motion-admin@example.test', name: 'Motion preview', password: 'motion-preview-password-1234' } });
    expect(response.ok()).toBeTruthy();
    const store = new PlatformStore(process.env.AIRL_LIVE_DB_PATH);
    try { store.bootstrapAdmin('motion-admin@example.test'); } finally { store.close(); }
    for (const page of [visitor, creator]) {
      for (const size of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 1440, height: 900 }]) {
        await page.setViewportSize(size);
        await page.goto(origin);
        const control = page.locator('header').getByRole('combobox', { name: 'Color theme', exact: true });
        await expect(page.getByRole('combobox', { name: 'Color theme', exact: true })).toHaveCount(1);
        await expect(control).toBeInViewport();
        await expect(control.locator('option')).toHaveText(['System', 'Light', 'Dark']);
        await control.selectOption('light');
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect.poll(() => page.evaluate(() => localStorage.getItem('airl-theme'))).toBe('light');
        await control.focus();
        await expect(control).toBeFocused();
        await expect(page.locator('header .theme-switcher')).toHaveCSS('outline-style', 'solid');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Header at ${size.width}`).toBe(true);
        await page.getByRole('link', { name: 'Explore Universes', exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect(page.locator('.world-card').first()).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.reload();
        await expect(page.locator('header').getByRole('combobox', { name: 'Color theme', exact: true })).toHaveValue('light');
      }
    }
    await visitor.goto(origin);
    await expect(visitor.locator('.landing-copy h1')).toHaveCSS('animation-name', 'airl-rise-in');
    await expect(visitor.locator('.landing-copy h1')).toHaveCSS('opacity', '1');
    await expect(visitor.locator('.landing-feature')).toHaveCSS('opacity', '1');
    await visitor.locator('.landing-actions .button-primary').hover();
    await expect(visitor.locator('.landing-actions .button-primary')).not.toHaveCSS('transform', 'none');
    await visitor.mouse.move(0, 0);
    await visitor.evaluate(() => document.fonts.ready);
    await visitor.screenshot({ path: '/tmp/airl-motion-light-desktop.png', fullPage: true });
    await visitor.emulateMedia({ reducedMotion: 'reduce' });
    await expect(visitor.locator('.landing-copy h1')).toHaveCSS('animation-name', 'none');
    await expect(visitor.locator('.landing-feature')).toHaveCSS('animation-name', 'none');
    await expect(visitor.locator('body')).toHaveCSS('transition-duration', '0s');
    await visitor.setViewportSize({ width: 390, height: 844 });
    await visitor.reload();
    await visitor.screenshot({ path: '/tmp/airl-motion-light-mobile.png', fullPage: true });
    await visitor.locator('header').getByRole('combobox', { name: 'Color theme', exact: true }).selectOption('system');
    await expect(visitor.locator('html')).toHaveAttribute('data-theme', 'dark');
    await visitor.emulateMedia({ colorScheme: 'light' });
    await expect(visitor.locator('html')).toHaveAttribute('data-theme', 'light');
    // Keep the live announcement region mounted while actual status content changes.
    const job = { id: 'motion-status', status: 'running', mode: 'ollama', manifest: null, progress: { stage: 'Story Director', status: 'started' } };
    await visitor.route('**/api/production?universe=barangay-2099', route => route.fulfill({ json: { jobs: [job] } }));
    await visitor.goto(`${origin}/live/barangay-2099`);
    const update = visitor.locator('.production-update[role=status]');
    await expect(update).toContainText('Story Director');
    const originalRegion = await update.evaluateHandle(element => element);
    job.progress.stage = 'Screenwriter';
    await visitor.evaluate(() => window.dispatchEvent(new CustomEvent('airl-production:barangay-2099')));
    await expect(update).toContainText('Screenwriter');
    expect(await update.evaluate((element, original) => element === original, originalRegion)).toBe(true);
    await originalRegion.dispose();
    expect(errors).toEqual([]);
  } finally { await guest.close(); await admin.close(); }
});

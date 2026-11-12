import { test, expect } from '@playwright/test';
import { PlatformStore } from '../../src/server/platform/store';

const origin = 'http://127.0.0.1:3100';
test('public entertainment and the protected Dashboard share one theme and preserve scoped tool access', async ({ browser }) => {
  const guest = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light', reducedMotion: 'reduce' });
  const admin = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await guest.newPage(), workspace = await admin.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  workspace.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('/');
    // New visitors start in dark mode; explicit System/Light choices still persist.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const header = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    await expect(header.getByRole('link')).toHaveText(['Explore', 'Live', 'Sign in']);
    await expect(page.getByRole('link', { name: 'Join Live', exact: true })).toHaveAttribute('href', '/live/barangay-2099');
    await expect(page.getByRole('link', { name: 'Explore Universes', exact: true })).toBeVisible();
    await page.getByLabel('Color theme').selectOption('system');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByLabel('Color theme').selectOption('dark');
    await page.goto('/universes/barangay-2099');
    await expect(page.getByRole('navigation', { name: 'Universe navigation' }).getByRole('link')).toHaveText(['Overview', 'Episodes', 'Characters', 'Live']);
    await expect(page.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute('aria-current', 'page');
    const response = await admin.request.post('/api/account', { headers: { Origin: origin }, data: { action: 'signup', email: 'unified-admin@example.test', name: 'AIRL preview admin', password: 'unified-test-password-1234' } });
    expect(response.ok()).toBeTruthy();
    const store = new PlatformStore(process.env.AIRL_LIVE_DB_PATH);
    try { store.bootstrapAdmin('unified-admin@example.test'); } finally { store.close(); }
    for (const size of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
      await workspace.setViewportSize(size);
      for (const route of ['/studio', '/studio/worlds/barangay-2099', '/studio/barangay-2099', '/studio/ai']) {
        await workspace.goto(route);
        if (size.width < 801) {
          const menu = workspace.getByRole('button', { name: 'Workspace menu', exact: true });
          await expect(menu).toBeVisible();
          if (!(await workspace.getByRole('navigation', { name: 'Dashboard navigation' }).isVisible())) await menu.click();
          await expect(menu).toHaveAttribute('aria-expanded', 'true');
        }
        await expect(workspace.getByRole('navigation', { name: 'Dashboard navigation' })).toBeVisible();
        await expect(workspace.getByRole('navigation', { name: 'Main navigation', exact: true })).toHaveCount(0);
        await expect(workspace.locator('main h1')).toBeVisible();
        expect(await workspace.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${size.width}`).toBe(true);
      }
    }
    await workspace.setViewportSize({ width: 1440, height: 900 });
    await workspace.goto('/studio');
    await expect(workspace.getByRole('heading', { name: 'My universes', exact: true })).toBeVisible();
    await expect(workspace.getByRole('heading', { name: 'Barangay 2099', exact: true })).toBeVisible();
    await workspace.evaluate(() => document.fonts.ready);
    await workspace.screenshot({ path: '/tmp/airl-unified-dashboard.png', fullPage: true });
    await workspace.getByRole('link', { name: 'Open Studio', exact: true }).filter({ hasText: 'Open Studio' }).first().click();
    await expect(workspace.getByRole('heading', { name: 'World Settings', exact: true })).toBeVisible();
    await expect(workspace.getByRole('navigation', { name: 'Dashboard navigation' }).getByRole('link', { name: 'Characters', exact: true })).toHaveAttribute('href', /\/studio\/worlds\/.+#world-cast$/);
    await workspace.evaluate(() => document.fonts.ready);
    await workspace.screenshot({ path: '/tmp/airl-unified-world-management.png', fullPage: true });
    await workspace.setViewportSize({ width: 390, height: 844 });
    await workspace.reload();
    await expect(workspace.getByRole('heading', { name: 'World Settings', exact: true })).toBeVisible();
    const mobileMenu = workspace.getByRole('button', { name: 'Workspace menu', exact: true });
    await expect(mobileMenu).toHaveAttribute('aria-expanded', 'false');
    await workspace.screenshot({ path: '/tmp/airl-unified-dashboard-mobile.png' });
    await mobileMenu.focus();
    await workspace.keyboard.press('Enter');
    await expect(workspace.getByRole('navigation', { name: 'Dashboard navigation' })).toBeVisible();
    await workspace.keyboard.press('Enter');
    await expect(workspace.getByRole('navigation', { name: 'Dashboard navigation' })).not.toBeVisible();
    await expect(mobileMenu).toBeFocused();
    await workspace.goto('/universes/barangay-2099/characters/captain-bot');
    await expect(workspace.locator('.story-helper').getByLabel('Production provider')).toHaveCount(0);
    await expect(workspace.locator('.story-helper').getByRole('button', { name: 'Ask the story', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  } finally { await guest.close(); await admin.close(); }
});

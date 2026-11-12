import { test, expect } from '@playwright/test';

test('public landing and discovery stay usable across sizes, themes and keyboard navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const theme of ['light', 'dark']) {
      await page.goto('/?universe=barangay-2099&round=retained-round&episode=retained-episode');
      await page.getByLabel('Color theme').selectOption(theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.getByRole('heading', { name: 'The real world is the prompt.' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Create a Universe', exact: true })).toHaveCount(0);
      await expect(page.getByRole('link', { name: /Launch Journey/ })).toHaveAttribute('href', /round=retained-round&episode=retained-episode/);
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'AIRL home' })).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole('link', { name: 'Explore Universes', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Explore universes' })).toBeVisible();
      await expect(page.locator('.world-card').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await page.getByRole('searchbox', { name: 'Search universes' }).fill('BARANGAY');
  await expect(page.locator('.world-card')).toHaveCount(1);
  await page.getByLabel('Genre', { exact: true }).selectOption({ index: 1 });
  await page.getByRole('searchbox', { name: 'Search universes' }).fill('no-such-universe-xyz');
  await expect(page.getByRole('heading', { name: 'No worlds match just yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.world-card').first()).toBeVisible();
  await page.getByRole('link', { name: 'Explore Barangay 2099', exact: true }).click();
  await expect(page).toHaveURL(/\/universes\/barangay-2099$/);
  for (const path of ['/platform', '/cinemai', '/persona', '/discover', '/watch/barangay-2099', '/universe/barangay-2099', '/live/barangay-2099'])
    expect((await page.request.get(path)).status(), path).toBe(200);
  for (const path of ['/universes/not-a-world', '/live/not-a-world', '/studio', '/studio/barangay-2099'])
    expect((await page.request.get(path)).status(), path).toBe(404);
  expect(errors).toEqual([]);
});

test('discovery distinguishes loading, empty results and request failures', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/universes', async route => {
    await pending;
    await route.fulfill({ json: { universes: [] } });
  });
  await page.goto('/universes');
  await expect(page.getByRole('status')).toContainText('Finding your next story');
  release();
  await expect(page.getByRole('heading', { name: 'The next story is still to come.' })).toBeVisible();
  await page.unroute('**/api/universes');
  await page.route('**/api/universes', route => route.fulfill({ status: 503, json: { error: 'Discovery temporarily unavailable' } }));
  await page.reload();
  await expect(page.getByRole('region', { name: 'Universe discovery' }).getByRole('alert')).toHaveText('Discovery temporarily unavailable');
});

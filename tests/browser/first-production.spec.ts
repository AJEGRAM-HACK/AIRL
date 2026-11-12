import { existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';

test('first production plays the local film with native controls and retains presentation context', async ({ browser }) => {
  test.skip(!existsSync('public/demo-media/Taho-Tender.mp4'), 'The local presenter film is installed separately.');
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/journey?universe=barangay-2099&step=premiere&film=veo&saved=1');
      await expect(page.locator('.journey-film-heading')).toContainText('First production · 4 shots · 32 seconds');
      await expect(page.getByRole('heading', { name: 'Taho Tender', exact: true })).toBeVisible();
      const video = page.locator('video');
      await expect(video).toBeVisible();
      await expect(page.getByRole('button', { name: 'Episode transcript', exact: true })).toHaveCount(0);
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2);
      await video.click();
      await video.evaluate((element: HTMLVideoElement) => element.play());
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0.3);
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => (element as HTMLVideoElement & { webkitAudioDecodedByteCount: number }).webkitAudioDecodedByteCount)).toBeGreaterThan(0);
      for (const seconds of [20, 0, 8]) {
        await video.evaluate((element: HTMLVideoElement, time) => { element.pause(); element.currentTime = time; }, seconds);
        await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeCloseTo(seconds, 0);
        await video.evaluate((element: HTMLVideoElement) => element.play());
        await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(seconds + 0.3);
      }
      await video.evaluate((element: HTMLVideoElement) => element.pause());
      await video.focus();
      await page.keyboard.press('ArrowRight');
      await expect(page).toHaveURL(/step=premiere/);
      const box = await video.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      await page.getByRole('link', { name: 'Exit to Explore', exact: true }).click();
      await expect(page).toHaveURL(/film=veo/);
      await page.getByRole('link', { name: 'Journey mode', exact: true }).click();
      await expect(video).toBeVisible();
      const response = await context.request.get('/demo-media/Taho-Tender.mp4', { headers: { Range: 'bytes=0-1023' } });
      expect(response.status()).toBe(206);
      expect((await response.body()).length).toBe(1024);
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  }
});

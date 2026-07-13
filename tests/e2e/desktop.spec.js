import { test, expect } from '@playwright/test';

test('desktop hides itinerary and displays a rendered QR prompt', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.locator('[data-desktop-gate]')).toBeVisible();
  await expect(page.getByText('请使用手机打开')).toBeVisible();
  await expect(page.locator('[data-mobile-app]')).toBeHidden();

  const hasQrPixels = await page.locator('[data-qr-code]').evaluate((canvas) => {
    const context = canvas.getContext('2d');
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 !== 3 && value < 200);
  });
  expect(hasQrPixels).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('desktop-gate.png'), fullPage: false });
});

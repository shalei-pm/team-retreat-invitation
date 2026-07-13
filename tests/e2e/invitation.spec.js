import { test, expect } from '@playwright/test';

test('invitation opens by click, plays music, and relocks on return', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('[data-loading]')).toBeHidden({ timeout: 5000 });

  const app = page.locator('[data-mobile-app]');
  await expect(app).toHaveClass(/is-locked/);
  await expect.poll(() => app.evaluate((element) => getComputedStyle(element).overflowY)).toBe('hidden');

  await page.locator('[data-open-invitation]').click();
  await expect(page.locator('[data-page="2"]')).toBeInViewport({ timeout: 3000 });
  await expect(page.locator('[data-music-toggle]').first()).toHaveClass(/is-playing/);

  await page.locator('[data-music-toggle]').first().click();
  await expect(page.locator('[data-music-toggle]').first()).not.toHaveClass(/is-playing/);

  await app.evaluate((element) => {
    element.style.scrollSnapType = 'none';
    element.scrollTop = element.clientHeight * 0.4;
    element.dispatchEvent(new Event('scroll'));
  });
  await expect(app).not.toHaveClass(/is-locked/);

  await app.evaluate((element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event('scroll'));
  });
  await expect(app).toHaveClass(/is-locked/);
  await expect(page.locator('[data-page="1"]')).toBeInViewport();
});

test('pages two through eight show subtle paging hints', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('[data-page="2"] .swipe-hint')).toHaveCount(1);
  await expect(page.locator('[data-page="8"] .swipe-hint')).toHaveCount(1);
  await expect(page.locator('[data-page="9"] .swipe-hint')).toHaveCount(0);
});

test('mobile cover is full viewport and visually nonblank', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.locator('[data-loading]')).toBeHidden({ timeout: 5000 });
  await page.locator('[data-open-invitation]').click();
  await expect(page.locator('[data-page="2"]')).toBeInViewport({ timeout: 3000 });

  const box = await page.locator('[data-page="2"]').boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(380);
  expect(box.height).toBeGreaterThanOrEqual(650);
  await page.screenshot({ path: testInfo.outputPath('mobile-cover.png'), fullPage: false });
});

test('envelope screen remains fully framed before opening', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.locator('[data-loading]')).toBeHidden({ timeout: 5000 });
  await expect(page.locator('[data-page="1"]')).toBeInViewport();
  await expect(page.locator('[data-open-invitation]')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('mobile-envelope.png'), fullPage: false });
});

test('all itinerary media renders and copy stays inside each screen', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.locator('[data-loading]')).toBeHidden({ timeout: 5000 });
  await page.locator('[data-open-invitation]').click();
  const app = page.locator('[data-mobile-app]');
  await app.evaluate((element) => {
    element.style.scrollSnapType = 'none';
    element.style.scrollBehavior = 'auto';
  });

  for (let pageNumber = 2; pageNumber <= 9; pageNumber += 1) {
    await app.evaluate((element, number) => {
      element.scrollTo({ top: (number - 1) * element.clientHeight });
    }, pageNumber);
    await expect(page.locator(`[data-page="${pageNumber}"]`)).toBeInViewport();

    const image = page.locator(`[data-page="${pageNumber}"] .screen-media img`);
    if (await image.count()) {
      await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
    }

    const copyFits = await page.locator(`[data-page="${pageNumber}"]`).evaluate((screen) => {
      const copy = screen.querySelector('.screen-copy');
      if (!copy) return true;
      const screenBox = screen.getBoundingClientRect();
      const copyBox = copy.getBoundingClientRect();
      return copyBox.left >= screenBox.left && copyBox.right <= screenBox.right
        && copyBox.top >= screenBox.top && copyBox.bottom <= screenBox.bottom;
    });
    expect(copyFits).toBe(true);

    if ([3, 7, 9].includes(pageNumber)) {
      await page.screenshot({ path: testInfo.outputPath(`mobile-page-${pageNumber}.png`), fullPage: false });
    }
  }
});

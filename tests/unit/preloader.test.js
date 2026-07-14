import test from 'node:test';
import assert from 'node:assert/strict';
import { preloadImages, progressPercent, resolveAssetUrl } from '../../src/preloader.js';

test('progress is bounded and rounded', () => {
  assert.equal(progressPercent(0, 3), 0);
  assert.equal(progressPercent(1, 3), 33);
  assert.equal(progressPercent(3, 3), 100);
  assert.equal(progressPercent(4, 3), 100);
});

test('relative asset paths resolve beneath a GitHub Pages base URL', () => {
  assert.equal(
    resolveAssetUrl('assets/images/road.webp', 'https://user.github.io/repo/'),
    'https://user.github.io/repo/assets/images/road.webp'
  );
});

test('a stalled image cannot block the invitation indefinitely', async () => {
  class StalledImage {
    set src(value) {
      this.value = value;
    }
  }

  const progress = [];
  const result = await Promise.race([
    preloadImages(
      ['assets/images/road.avif'],
      (value) => progress.push(value),
      {
        ImageCtor: StalledImage,
        baseUrl: 'https://user.github.io/repo/',
        timeoutMs: 5
      }
    ).then(() => 'resolved'),
    new Promise((resolve) => setTimeout(() => resolve('blocked'), 30))
  ]);

  assert.equal(result, 'resolved');
  assert.deepEqual(progress, [100]);
});

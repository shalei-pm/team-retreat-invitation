import test from 'node:test';
import assert from 'node:assert/strict';
import { progressPercent, resolveAssetUrl } from '../../src/preloader.js';

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

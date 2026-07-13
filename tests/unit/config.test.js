import test from 'node:test';
import assert from 'node:assert/strict';
import { CRITICAL_IMAGES } from '../../src/config.js';

test('critical preloads reuse the formats requested by the opening screens', () => {
  assert.deepEqual(CRITICAL_IMAGES, [
    'assets/images/road.avif',
    'assets/images/stay-aerial.avif',
    'assets/images/room.webp'
  ]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { pageFromScroll } from '../../src/paging.js';

test('scroll position maps to a clamped one-based page', () => {
  assert.equal(pageFromScroll(0, 800, 9), 1);
  assert.equal(pageFromScroll(820, 800, 9), 2);
  assert.equal(pageFromScroll(99999, 800, 9), 9);
});

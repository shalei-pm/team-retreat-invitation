import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldUseDesktopGate } from '../../src/desktop.js';

test('desktop gate is the inverse of the mobile coarse-pointer query', () => {
  assert.equal(shouldUseDesktopGate(true), false);
  assert.equal(shouldUseDesktopGate(false), true);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduceInvitation } from '../../src/state.js';

test('opening unlocks paging and marks animation active', () => {
  const next = reduceInvitation(initialState, { type: 'OPEN' });

  assert.deepEqual(next, { unlocked: true, opening: true, currentPage: 1 });
});

test('scroll events do not relock while the opening animation is active', () => {
  const next = reduceInvitation(
    { unlocked: true, opening: true, currentPage: 1 },
    { type: 'PAGE_CHANGED', page: 1 }
  );

  assert.equal(next.unlocked, true);
});

test('crossing into page one keeps paging unlocked until the envelope is reached', () => {
  const next = reduceInvitation(
    { unlocked: true, opening: false, currentPage: 2 },
    { type: 'PAGE_CHANGED', page: 1 }
  );

  assert.equal(next.unlocked, true);
});

test('reaching the envelope after opening relocks paging', () => {
  const next = reduceInvitation(
    { unlocked: true, opening: false, currentPage: 1 },
    { type: 'ENVELOPE_REACHED' }
  );

  assert.equal(next.unlocked, false);
});

test('finishing the animation does not lock before the envelope is reached', () => {
  const next = reduceInvitation(
    { unlocked: true, opening: true, currentPage: 1 },
    { type: 'OPEN_ANIMATION_FINISHED' }
  );

  assert.deepEqual(next, { unlocked: true, opening: false, currentPage: 1 });
});

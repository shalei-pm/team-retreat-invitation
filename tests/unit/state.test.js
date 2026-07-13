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

test('returning to page one after opening relocks paging', () => {
  const next = reduceInvitation(
    { unlocked: true, opening: false, currentPage: 2 },
    { type: 'PAGE_CHANGED', page: 1 }
  );

  assert.equal(next.unlocked, false);
});

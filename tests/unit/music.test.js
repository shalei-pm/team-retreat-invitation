import test from 'node:test';
import assert from 'node:assert/strict';
import { musicUiState } from '../../src/music.js';

test('music UI state reflects audio pause state', () => {
  assert.deepEqual(musicUiState(false), { playing: true, label: '暂停背景音乐' });
  assert.deepEqual(musicUiState(true), { playing: false, label: '播放背景音乐' });
});

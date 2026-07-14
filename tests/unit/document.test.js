import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('document contains the complete static invitation structure', async () => {
  const html = await fs.readFile(new URL('../../index.html', import.meta.url), 'utf8');

  assert.equal((html.match(/data-page="\d"/g) ?? []).length, 9);
  assert.equal((html.match(/data-music-toggle/g) ?? []).length, 8);
  assert.equal((html.match(/class="swipe-hint"/g) ?? []).length, 7);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 6);
  assert.match(html, /北京市怀柔区雁栖镇交界河村25号/);
  assert.match(html, /泳衣！！！务必带，否则请裸身！！/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { navigationUrl } from '../../src/navigation.js';

const destination = '漫拾光卡农野奢民宿，北京市怀柔区雁栖镇交界河村25号';

test('iPhone uses Apple Maps directions', () => {
  assert.match(navigationUrl('iPhone', destination), /^https:\/\/maps\.apple\.com\/\?daddr=/);
});

test('Android uses the default geo protocol', () => {
  assert.match(navigationUrl('Android', destination), /^geo:0,0\?q=/);
});

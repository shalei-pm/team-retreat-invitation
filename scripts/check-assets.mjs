import fs from 'node:fs/promises';
import path from 'node:path';

const imageDir = path.resolve('public/assets/images');
const files = (await fs.readdir(imageDir)).filter((name) => name.endsWith('.webp'));
let total = 0;

for (const file of files) {
  if (file.includes('-placeholder')) continue;
  const { size } = await fs.stat(path.join(imageDir, file));
  total += size;
  if (size > 300 * 1024) {
    throw new Error(`${file} exceeds 300 KB: ${Math.round(size / 1024)} KB`);
  }
}

if (total > 2 * 1024 * 1024) {
  throw new Error(`WebP total exceeds 2 MB: ${Math.round(total / 1024)} KB`);
}

console.log(`Asset budget OK: ${Math.round(total / 1024)} KB`);

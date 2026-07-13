import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const names = [
  'road',
  'stay-aerial',
  'room',
  'billiards',
  'mahjong',
  'pool',
  'bbq',
  'lake',
  'fish'
];
const sourceDir = path.resolve('assets/source');
const outputDir = path.resolve('public/assets/images');

await fs.mkdir(outputDir, { recursive: true });

for (const name of names) {
  const input = path.join(sourceDir, `${name}.jpg`);
  const image = sharp(input).rotate().resize({
    width: 1080,
    height: 1920,
    fit: 'cover',
    position: 'centre',
    withoutEnlargement: true
  });

  await Promise.all([
    image.clone().avif({ quality: 45, effort: 6 }).toFile(path.join(outputDir, `${name}.avif`)),
    image.clone().webp({ quality: 66, effort: 6 }).toFile(path.join(outputDir, `${name}.webp`)),
    image.clone().jpeg({ quality: 76, mozjpeg: true }).toFile(path.join(outputDir, `${name}.jpg`)),
    sharp(input)
      .rotate()
      .resize({ width: 36 })
      .blur(2)
      .webp({ quality: 32 })
      .toFile(path.join(outputDir, `${name}-placeholder.webp`))
  ]);
}

await sharp(path.join(sourceDir, 'road.jpg'))
  .rotate()
  .resize(600, 600, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.resolve('public/assets/share/share-cover.jpg'));

await fs.copyFile(
  path.join(sourceDir, 'beautiful-dream.mp3'),
  path.resolve('public/assets/audio/beautiful-dream.mp3')
);

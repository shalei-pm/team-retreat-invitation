# Team Retreat Invitation H5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a deployable pure-static mobile H5 invitation for the July 15-16 product and engineering leadership retreat.

**Architecture:** Use Vite only as a build tool; the shipped site is static HTML, CSS, JavaScript, images, and audio. Keep the nine-screen itinerary semantic in `index.html`, isolate interaction concerns into small ES modules, optimize media at build time with Sharp, and verify behavior with Node unit tests plus Playwright mobile/desktop tests.

**Tech Stack:** Vite, vanilla HTML/CSS/JavaScript, Node.js built-in test runner, Sharp, QRCode, Playwright.

---

## File Structure

- `package.json`: build, asset, unit-test, and browser-test commands.
- `.env.example`: public deployment URL used by Open Graph metadata.
- `index.html`: semantic loading screen, desktop gate, nine mobile screens, share metadata, and no-JavaScript fallback.
- `src/styles.css`: visual system, full-screen layout, responsive rules, animations, and reduced-motion behavior.
- `src/app.js`: application bootstrap and coordination between modules.
- `src/config.js`: itinerary copy, destination, asset paths, and music settings.
- `src/state.js`: pure invitation state transitions.
- `src/preloader.js`: critical-asset preload and progress reporting.
- `src/music.js`: lazy audio playback and synchronized icon state.
- `src/navigation.js`: platform-specific system-map URL selection.
- `src/paging.js`: scroll lock, unlock, snap, page activation, and hint behavior.
- `src/desktop.js`: desktop-only QR rendering and mobile content suppression.
- `assets/source/`: original user-provided images and licensed source audio.
- `public/assets/images/`: generated AVIF, WebP, JPEG fallback, and low-quality placeholders.
- `public/assets/audio/beautiful-dream.mp3`: local licensed background track.
- `public/assets/audio/LICENSE.md`: track source and license record.
- `public/assets/share/share-cover.jpg`: square social-sharing image.
- `scripts/optimize-assets.mjs`: reproducible image optimization pipeline.
- `scripts/check-assets.mjs`: performance-budget validation.
- `tests/unit/state.test.js`: state transition tests.
- `tests/unit/navigation.test.js`: native map URL tests.
- `tests/unit/preloader.test.js`: progress calculation tests.
- `tests/e2e/invitation.spec.js`: mobile interaction tests.
- `tests/e2e/desktop.spec.js`: desktop gate and QR tests.
- `playwright.config.js`: local static preview and device projects.

### Task 1: Scaffold The Static Build And Test Harness

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `src/config.js`
- Create: `playwright.config.js`

- [ ] **Step 1: Create the package manifest**

```json
{
  "name": "team-retreat-invitation",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "assets:optimize": "node scripts/optimize-assets.mjs",
    "assets:check": "node scripts/check-assets.mjs",
    "build": "npm run assets:optimize && vite build && npm run assets:check",
    "preview": "vite preview --host 0.0.0.0",
    "test": "node --test tests/unit/*.test.js",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.0",
    "sharp": "^0.34.3",
    "vite": "^7.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies and browsers**

Run:

```bash
npm install
npx playwright install chromium webkit
```

Expected: `node_modules/` and `package-lock.json` are created; Chromium and WebKit install without errors.

- [ ] **Step 3: Define public URL configuration**

Create `.env.example`:

```dotenv
VITE_PUBLIC_SITE_URL=https://example.com/team-retreat/
```

- [ ] **Step 4: Define immutable content configuration**

Create `src/config.js`:

```js
export const SITE = Object.freeze({
  title: '去山里，过夏天',
  description: '暂别屏幕与会议，共赴一场山野夏日之约',
  dates: '07.15 - 07.16',
  region: '怀柔 / 密云',
  destinationName: '漫拾光卡农野奢民宿(北京青龙峡神堂峪店)',
  destinationAddress: '北京市怀柔区雁栖镇交界河村25号',
  musicVolume: 0.32,
  totalPages: 9
});

export const CRITICAL_IMAGES = Object.freeze([
  '/assets/images/road.webp',
  '/assets/images/stay-aerial.webp',
  '/assets/images/room.webp'
]);
```

- [ ] **Step 5: Configure Playwright devices and preview server**

Create `playwright.config.js`:

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'mobile-webkit', testMatch: /invitation\.spec\.js/, use: { ...devices['iPhone 13'] } },
    { name: 'desktop-chromium', testMatch: /desktop\.spec\.js/, use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120000
  }
});
```

- [ ] **Step 6: Verify the harness starts from a known failing state**

Run: `npm test`

Expected: FAIL because `tests/unit/*.test.js` does not exist yet.

- [ ] **Step 7: Commit the scaffold**

```bash
git add package.json package-lock.json .env.example src/config.js playwright.config.js
git commit -m "build: scaffold static H5 toolchain"
```

### Task 2: Ingest And Optimize Media Assets

**Files:**
- Create: `assets/source/*.jpg`
- Create: `assets/source/beautiful-dream.mp3`
- Create: `scripts/optimize-assets.mjs`
- Create: `scripts/check-assets.mjs`
- Create: `public/assets/audio/LICENSE.md`
- Generate: `public/assets/images/*`
- Generate: `public/assets/share/share-cover.jpg`
- Generate: `public/assets/audio/beautiful-dream.mp3`

- [ ] **Step 1: Copy the selected source media into stable project paths**

Run:

```bash
mkdir -p assets/source public/assets/audio public/assets/images public/assets/share
cp .superpowers/brainstorm/76098-1783935979/content/road.jpg assets/source/road.jpg
cp .superpowers/brainstorm/76098-1783935979/content/cover.jpg assets/source/stay-aerial.jpg
cp .superpowers/brainstorm/76098-1783935979/content/room.jpg assets/source/room.jpg
cp .superpowers/brainstorm/76098-1783935979/content/billiards.jpg assets/source/billiards.jpg
cp .superpowers/brainstorm/76098-1783935979/content/mahjong.jpg assets/source/mahjong.jpg
cp .superpowers/brainstorm/76098-1783935979/content/pool.jpg assets/source/pool.jpg
cp .superpowers/brainstorm/76098-1783935979/content/bbq.jpg assets/source/bbq.jpg
cp .superpowers/brainstorm/76098-1783935979/content/lake.jpg assets/source/lake.jpg
cp .superpowers/brainstorm/76098-1783935979/content/fish.jpg assets/source/fish.jpg
cp .superpowers/brainstorm/76098-1783935979/content/beautiful-dream.mp3 assets/source/beautiful-dream.mp3
```

Expected: ten stable source files exist under `assets/source/`.

- [ ] **Step 2: Implement deterministic image optimization**

Create `scripts/optimize-assets.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const names = [
  'road', 'stay-aerial', 'room', 'billiards', 'mahjong',
  'pool', 'bbq', 'lake', 'fish'
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
    image.clone().avif({ quality: 48, effort: 6 }).toFile(path.join(outputDir, `${name}.avif`)),
    image.clone().webp({ quality: 74, effort: 6 }).toFile(path.join(outputDir, `${name}.webp`)),
    image.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(outputDir, `${name}.jpg`)),
    sharp(input).rotate().resize({ width: 36 }).blur(2).webp({ quality: 35 })
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
```

- [ ] **Step 3: Add media license documentation**

Create `public/assets/audio/LICENSE.md`:

```markdown
# Background Music

- Track: Beautiful Dream
- Artist: Diego Nava
- Source: https://mixkit.co/free-stock-music/
- Asset URL used during development: https://assets.mixkit.co/music/493/493.mp3
- License: Mixkit Free License
```

- [ ] **Step 4: Add the asset budget check**

Create `scripts/check-assets.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';

const imageDir = path.resolve('public/assets/images');
const files = (await fs.readdir(imageDir)).filter((name) => name.endsWith('.webp'));
let total = 0;

for (const file of files) {
  if (file.includes('-placeholder')) continue;
  const { size } = await fs.stat(path.join(imageDir, file));
  total += size;
  if (size > 300 * 1024) throw new Error(`${file} exceeds 300 KB: ${size}`);
}

if (total > 2 * 1024 * 1024) throw new Error(`WebP total exceeds 2 MB: ${total}`);
console.log(`Asset budget OK: ${Math.round(total / 1024)} KB`);
```

- [ ] **Step 5: Generate and validate media**

Run:

```bash
npm run assets:optimize
npm run assets:check
```

Expected: all image variants are generated; the WebP total is at most 2 MB; no primary WebP exceeds 300 KB.

- [ ] **Step 6: Commit source and generated media**

```bash
git add assets/source public/assets scripts/optimize-assets.mjs scripts/check-assets.mjs
git commit -m "assets: add optimized retreat media"
```

### Task 3: Build The Semantic Nine-Screen Document

**Files:**
- Create: `index.html`
- Create: `src/styles.css`

- [ ] **Step 1: Create the semantic HTML document**

Create `index.html` with these required elements and exact copy:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
  <meta name="theme-color" content="#e9e3d4">
  <title>去山里，过夏天</title>
  <meta name="description" content="暂别屏幕与会议，共赴一场山野夏日之约">
  <meta property="og:type" content="website">
  <meta property="og:title" content="去山里，过夏天">
  <meta property="og:description" content="暂别屏幕与会议，共赴一场山野夏日之约">
  <meta property="og:url" content="%VITE_PUBLIC_SITE_URL%">
  <meta property="og:image" content="%VITE_PUBLIC_SITE_URL%assets/share/share-cover.jpg">
  <link rel="stylesheet" href="/src/styles.css">
</head>
<body>
  <div class="loading-screen" data-loading aria-live="polite">
    <svg class="loading-road" viewBox="0 0 220 150" aria-hidden="true">
      <path d="M18 130C72 126 42 92 102 82C162 72 105 42 196 20" />
    </svg>
    <p class="loading-title">正在把工作留在山下……</p>
    <p class="loading-subtitle">收拾心情，准备进山</p>
    <div class="loading-track"><span data-loading-bar></span></div>
    <output data-loading-percent>0%</output>
  </div>

  <main class="mobile-app is-locked" data-mobile-app>
    <audio data-background-music src="/assets/audio/beautiful-dream.mp3" loop preload="none"></audio>

    <section class="screen envelope-screen" data-page="1" aria-labelledby="envelope-title">
      <h1 id="envelope-title" class="hand-note">何其正喊你<br>放下工作，来团建啦！</h1>
      <svg class="hand-curve" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M63 20C83 22 81 38 50 45M54 41L50 45L56 46" />
      </svg>
      <button class="envelope" data-open-invitation type="button" aria-label="启封邀请">
        <span class="seal">启封</span>
      </button>
      <p class="tap-hint">轻触蜡封 · 开启邀请</p>
      <p class="recipient">致 · 产研负责人团队</p>
    </section>

    <section class="screen photo-screen" data-page="2" aria-labelledby="cover-title">
      <picture class="screen-media">
        <source srcset="/assets/images/road.avif" type="image/avif">
        <source srcset="/assets/images/road.webp" type="image/webp">
        <img src="/assets/images/road.jpg" alt="车窗外蜿蜒进入山林的道路">
      </picture>
      <button class="music-button" data-music-toggle type="button" aria-label="播放背景音乐">♪</button>
      <span class="page-count">02 / 09</span>
      <button class="location-stamp" data-native-navigation type="button">
        <small>DESTINATION · 点击导航</small>
        <strong>漫拾光卡农野奢民宿<br>(北京青龙峡神堂峪店)</strong>
        <span>北京市怀柔区雁栖镇交界河村25号</span>
      </button>
      <div class="screen-copy">
        <small>SUMMER RETREAT · 2026</small>
        <h2 id="cover-title">去山里<br>过夏天</h2>
        <p>暂别屏幕与会议<br>沿着山路，去风里坐一会儿<br>把这个夏天，过得慢一点</p>
        <small>07.15 - 07.16 · 怀柔 / 密云</small>
      </div>
      <span class="swipe-hint" aria-hidden="true"></span>
    </section>

    <section class="screen photo-screen" data-page="3" aria-labelledby="stay-title">
      <picture class="screen-media"><source srcset="/assets/images/stay-aerial.avif" type="image/avif"><source srcset="/assets/images/stay-aerial.webp" type="image/webp"><img src="/assets/images/stay-aerial.jpg" alt="傍晚亮灯的民宿俯瞰"></picture>
      <img class="inset-photo" src="/assets/images/room.webp" alt="民宿客房环境">
      <button class="music-button" data-music-toggle type="button" aria-label="播放背景音乐">♪</button><span class="page-count">03 / 09</span>
      <span class="day-watermark"><small>DAY</small><b>1</b></span>
      <div class="screen-copy"><small>ARRIVAL · HUAIROU</small><h2 id="stay-title">山里的<br>临时住处</h2><p>午饭后出发，抵达脸谱溪梦<br>先安顿下来，再把时间慢下来</p></div>
      <span class="swipe-hint" aria-hidden="true"></span>
    </section>

    <section class="screen photo-screen" data-page="4" aria-labelledby="play-title">
      <picture class="screen-media"><source srcset="/assets/images/billiards.avif" type="image/avif"><source srcset="/assets/images/billiards.webp" type="image/webp"><img src="/assets/images/billiards.jpg" alt="山景窗边的台球桌"></picture>
      <img class="inset-photo" src="/assets/images/mahjong.webp" alt="民宿麻将桌">
      <button class="music-button" data-music-toggle type="button" aria-label="播放背景音乐">♪</button><span class="page-count">04 / 09</span>
      <span class="day-watermark"><small>DAY</small><b>1</b></span>
      <div class="screen-copy"><small>SLOW DOWN</small><h2 id="play-title">没有排期的<br>下午</h2><p>台球 · 麻将 · 游戏 · 卡拉 OK<br>各自放松，随意尽兴</p></div>
      <span class="swipe-hint" aria-hidden="true"></span>
    </section>

    <section class="screen photo-screen" data-page="5" aria-labelledby="pool-title">
      <picture class="screen-media"><source srcset="/assets/images/pool.avif" type="image/avif"><source srcset="/assets/images/pool.webp" type="image/webp"><img src="/assets/images/pool.jpg" alt="阳光下的民宿泳池"></picture>
      <button class="music-button" data-music-toggle type="button" aria-label="播放背景音乐">♪</button><span class="page-count">05 / 09</span>
      <span class="day-watermark"><small>DAY</small><b>1</b></span>
      <div class="screen-copy"><small>POOL TIME</small><h2 id="pool-title">跳进<br>夏天里</h2><p>泳池派对 · 玩水 · 合影<br>把夏日的燥热留在水里</p></div>
      <span class="swipe-hint" aria-hidden="true"></span>
    </section>

    <section class="screen photo-screen" data-page="6" aria-labelledby="bbq-title">
      <picture class="screen-media"><source srcset="/assets/images/bbq.avif" type="image/avif"><source srcset="/assets/images/bbq.webp" type="image/webp"><img src="/assets/images/bbq.jpg" alt="铺满烤串和夜宵的餐桌"></picture>
      <button class="music-button" data-music-toggle type="button" aria-label="播放背景音乐">♪</button><span class="page-count">06 / 09</span>
      <span class="day-watermark"><small>DAY</small><b>1</b></span>
      <div class="screen-copy"><small>DINNER TIME</small><h2 id="bbq-title">山野<br>夜宴</h2><p>烧烤 · 鸭货 · 零食 · 冰啤酒<br>边吃边聊，慢慢入夜</p></div>
      <span class="swipe-hint" aria-hidden="true"></span>
    </section>

    <section class="screen photo-screen" data-page="7" aria-labelledby="lake-title">
      <picture class="screen-media"><source srcset="/assets/images/lake.avif" type="image/avif"><source srcset="/assets/images/lake.webp" type="image/webp"><img src="/assets/images/lake.jpg" alt="日光山谷俯瞰密云水库"></picture>
      <button class="music-button" data-music-toggle type="button" aria-label="播放背景音乐">♪</button><span class="page-count">07 / 09</span>
      <span class="day-watermark"><small>DAY</small><b>2</b></span>
      <div class="screen-copy"><small>MIYUN RESERVOIR</small><h2 id="lake-title">去北京的海<br>看一看</h2><p>日光山谷 · 密云水库<br>看水、吹风、留下合影</p></div>
      <span class="swipe-hint" aria-hidden="true"></span>
    </section>

    <section class="screen photo-screen" data-page="8" aria-labelledby="fish-title">
      <picture class="screen-media"><source srcset="/assets/images/fish.avif" type="image/avif"><source srcset="/assets/images/fish.webp" type="image/webp"><img src="/assets/images/fish.jpg" alt="水库鱼和配菜摆满餐桌"></picture>
      <button class="music-button" data-music-toggle type="button" aria-label="播放背景音乐">♪</button><span class="page-count">08 / 09</span>
      <span class="day-watermark"><small>DAY</small><b>2</b></span>
      <div class="screen-copy"><small>LUNCH</small><h2 id="fish-title">认真吃一顿<br>水库鱼</h2><p>旅行的最后一餐<br>吃饱喝足，再准备回城</p></div>
      <span class="swipe-hint" aria-hidden="true"></span>
    </section>

    <section class="screen packing-screen" data-page="9" aria-labelledby="packing-title">
      <button class="music-button" data-music-toggle type="button" aria-label="播放背景音乐">♪</button><span class="page-count">09 / 09</span>
      <div class="screen-copy"><small>BEFORE WE GO</small><h2 id="packing-title">出发前<br>再检查一下</h2><ol><li>泳衣！！！务必带，否则请裸身！！</li><li>防蚊液</li><li>换洗衣物</li></ol><p>乘兴而来 · 尽兴而归</p></div>
    </section>
  </main>

  <aside class="desktop-gate" data-desktop-gate hidden>
    <p>请使用手机打开</p>
    <canvas data-qr-code aria-label="当前页面二维码"></canvas>
    <small>去山里，过夏天 · 07.15 - 07.16</small>
  </aside>

  <noscript>去山里，过夏天。07.15 - 07.16。地址：北京市怀柔区雁栖镇交界河村25号。</noscript>
  <script type="module" src="/src/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Add base layout and visual tokens**

Create `src/styles.css` with these required foundations:

```css
:root {
  color-scheme: light;
  --paper: #e9e3d4;
  --forest: #596755;
  --ink: #44503f;
  --cream: #f7f3e9;
  --accent: #fff3cf;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
}
* { box-sizing: border-box; }
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: var(--paper); }
button { font: inherit; }
.mobile-app { width: 100vw; height: 100dvh; overflow-y: auto; scroll-snap-type: y mandatory; scrollbar-width: none; }
.mobile-app::-webkit-scrollbar { display: none; }
.mobile-app.is-locked { overflow-y: hidden; }
.screen { position: relative; width: 100%; min-height: 100dvh; overflow: hidden; scroll-snap-align: start; scroll-snap-stop: always; }
.screen-media { position: absolute; inset: 0; }
.screen-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent 25%, rgba(20, 28, 22, .76)); }
.screen-media img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.03); transition: filter .5s ease, opacity .5s ease; }
.screen-copy { position: absolute; inset: auto 0 0; z-index: 3; padding: 2rem 1.7rem 3rem; color: var(--cream); }
.screen-copy h2 { margin: .6rem 0; font: 400 2rem/1.18 "Songti SC", "STSong", serif; letter-spacing: 0; }
.screen-copy p { font-size: .78rem; line-height: 1.75; }
```

- [ ] **Step 3: Verify the document builds before behavior exists**

Run: `npm run build`

Expected: Vite writes `dist/index.html`; there are no missing asset errors.

- [ ] **Step 4: Commit the semantic document**

```bash
git add index.html src/styles.css
git commit -m "feat: add semantic nine-screen invitation"
```

### Task 4: Implement Test-Driven Invitation State And Preloading

**Files:**
- Create: `src/state.js`
- Create: `src/preloader.js`
- Create: `tests/unit/state.test.js`
- Create: `tests/unit/preloader.test.js`

- [ ] **Step 1: Write failing state transition tests**

Create `tests/unit/state.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduceInvitation } from '../../src/state.js';

test('opening unlocks paging and marks animation active', () => {
  const next = reduceInvitation(initialState, { type: 'OPEN' });
  assert.deepEqual(next, { unlocked: true, opening: true, currentPage: 1 });
});

test('returning to page one relocks paging', () => {
  const next = reduceInvitation(
    { unlocked: true, opening: false, currentPage: 2 },
    { type: 'PAGE_CHANGED', page: 1 }
  );
  assert.equal(next.unlocked, false);
});
```

- [ ] **Step 2: Run the state test and verify failure**

Run: `node --test tests/unit/state.test.js`

Expected: FAIL because `src/state.js` does not exist.

- [ ] **Step 3: Implement the minimal reducer**

Create `src/state.js`:

```js
export const initialState = Object.freeze({ unlocked: false, opening: false, currentPage: 1 });

export function reduceInvitation(state, event) {
  switch (event.type) {
    case 'OPEN':
      return { ...state, unlocked: true, opening: true };
    case 'OPEN_ANIMATION_FINISHED':
      return { ...state, opening: false };
    case 'PAGE_CHANGED':
      return {
        ...state,
        currentPage: event.page,
        unlocked: event.page === 1 && !state.opening ? false : state.unlocked
      };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Write failing preload progress tests**

Create `tests/unit/preloader.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { progressPercent } from '../../src/preloader.js';

test('progress is bounded and rounded', () => {
  assert.equal(progressPercent(0, 3), 0);
  assert.equal(progressPercent(1, 3), 33);
  assert.equal(progressPercent(3, 3), 100);
  assert.equal(progressPercent(4, 3), 100);
});
```

- [ ] **Step 5: Run the preload test and verify failure**

Run: `node --test tests/unit/preloader.test.js`

Expected: FAIL because `progressPercent` is missing.

- [ ] **Step 6: Implement critical asset preloading**

Create `src/preloader.js`:

```js
export function progressPercent(loaded, total) {
  if (total <= 0) return 100;
  return Math.min(100, Math.round((loaded / total) * 100));
}

export async function preloadImages(urls, onProgress) {
  let loaded = 0;
  await Promise.all(urls.map((url) => new Promise((resolve) => {
    const image = new Image();
    image.onload = image.onerror = () => {
      loaded += 1;
      onProgress(progressPercent(loaded, urls.length));
      resolve();
    };
    image.src = url;
  })));
}
```

- [ ] **Step 7: Run unit tests**

Run: `npm test`

Expected: all state and preloader tests PASS.

- [ ] **Step 8: Commit state and preload behavior**

```bash
git add src/state.js src/preloader.js tests/unit/state.test.js tests/unit/preloader.test.js
git commit -m "feat: add invitation state and preloader"
```

### Task 5: Implement Paging, Opening, And Motion

**Files:**
- Create: `src/paging.js`
- Create: `src/app.js`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement scroll locking and opening coordination**

Create `src/paging.js`:

```js
import { initialState, reduceInvitation } from './state.js';

export function createPagingController({ root, openButton, onOpen }) {
  let state = initialState;

  function render() {
    root.classList.toggle('is-locked', !state.unlocked);
    root.classList.toggle('is-opening', state.opening);
  }

  openButton.addEventListener('click', async () => {
    if (state.opening) return;
    state = reduceInvitation(state, { type: 'OPEN' });
    render();
    onOpen();
    await new Promise((resolve) => setTimeout(resolve, 620));
    root.scrollTo({ top: root.clientHeight, behavior: 'smooth' });
    await new Promise((resolve) => setTimeout(resolve, 580));
    state = reduceInvitation(state, { type: 'OPEN_ANIMATION_FINISHED' });
    render();
  });

  root.addEventListener('scroll', () => {
    const page = Math.round(root.scrollTop / root.clientHeight) + 1;
    state = reduceInvitation(state, { type: 'PAGE_CHANGED', page });
    render();
  }, { passive: true });

  render();
}
```

- [ ] **Step 2: Bootstrap loading and paging**

Create `src/app.js`:

```js
import { CRITICAL_IMAGES } from './config.js';
import { preloadImages } from './preloader.js';
import { createPagingController } from './paging.js';

const root = document.querySelector('[data-mobile-app]');
const loader = document.querySelector('[data-loading]');
const bar = document.querySelector('[data-loading-bar]');
const percent = document.querySelector('[data-loading-percent]');

await Promise.all([
  preloadImages(CRITICAL_IMAGES, (value) => {
    bar.style.width = `${value}%`;
    percent.value = `${value}%`;
    percent.textContent = `${value}%`;
  }),
  new Promise((resolve) => setTimeout(resolve, 1200))
]);
loader.classList.add('is-complete');

createPagingController({
  root,
  openButton: document.querySelector('[data-open-invitation]'),
  onOpen: () => {}
});
```

- [ ] **Step 3: Add required animation CSS**

Append to `src/styles.css`:

```css
.loading-screen { position: fixed; inset: 0; z-index: 100; display: grid; place-content: center; justify-items: center; background: var(--paper); transition: opacity .6s ease, visibility .6s ease; }
.loading-screen.is-complete { opacity: 0; visibility: hidden; pointer-events: none; }
.loading-road path, .hand-curve path { fill: none; stroke: var(--forest); stroke-linecap: round; stroke-dasharray: 260; animation: draw-line 2s ease forwards; }
.envelope-screen { background: var(--paper); color: var(--ink); }
.envelope-screen .seal { animation: breathe 2.2s ease-in-out infinite; }
.mobile-app.is-opening .envelope, .mobile-app.is-opening .hand-note, .mobile-app.is-opening .hand-curve { animation: envelope-away .85s ease forwards; }
.swipe-hint { position: absolute; left: 50%; bottom: .75rem; width: 1.1rem; height: .75rem; z-index: 6; animation: hint-up 1.8s ease-in-out infinite; }
.swipe-hint::before { content: ""; position: absolute; width: .55rem; height: .55rem; border-top: 1.5px solid rgba(255,255,255,.9); border-left: 1.5px solid rgba(255,255,255,.9); transform: rotate(45deg); }
@keyframes draw-line { to { stroke-dashoffset: 0; } }
@keyframes breathe { 50% { transform: scale(1.08); } }
@keyframes envelope-away { to { transform: translateY(-6rem) scale(.92); opacity: 0; } }
@keyframes hint-up { 50% { transform: translate(-50%, -.35rem); opacity: .9; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 4: Run unit tests and build**

Run:

```bash
npm test
npm run build
```

Expected: unit tests PASS; Vite build succeeds.

- [ ] **Step 5: Commit paging and motion**

```bash
git add src/app.js src/paging.js src/styles.css
git commit -m "feat: add invitation opening and paging"
```

### Task 6: Add Music And Native Navigation With Unit Tests

**Files:**
- Create: `src/music.js`
- Create: `src/navigation.js`
- Modify: `src/app.js`
- Create: `tests/unit/navigation.test.js`

- [ ] **Step 1: Write failing native navigation tests**

Create `tests/unit/navigation.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { navigationUrl } from '../../src/navigation.js';

const destination = '漫拾光卡农野奢民宿，北京市怀柔区雁栖镇交界河村25号';

test('iPhone uses Apple Maps directions', () => {
  assert.match(navigationUrl('iPhone', destination), /^https:\/\/maps\.apple\.com\/\?daddr=/);
});

test('Android uses the geo protocol', () => {
  assert.match(navigationUrl('Android', destination), /^geo:0,0\?q=/);
});
```

- [ ] **Step 2: Run the navigation test and verify failure**

Run: `node --test tests/unit/navigation.test.js`

Expected: FAIL because `src/navigation.js` does not exist.

- [ ] **Step 3: Implement platform navigation**

Create `src/navigation.js`:

```js
import { SITE } from './config.js';

export function navigationUrl(userAgent, destination) {
  const encoded = encodeURIComponent(destination);
  if (/iPhone|iPad|iPod/i.test(userAgent)) return `https://maps.apple.com/?daddr=${encoded}&dirflg=d`;
  if (/Android/i.test(userAgent)) return `geo:0,0?q=${encoded}`;
  return `https://maps.apple.com/?q=${encoded}`;
}

export function bindNativeNavigation(button) {
  const destination = `${SITE.destinationName}，${SITE.destinationAddress}`;
  button.addEventListener('click', () => {
    window.location.href = navigationUrl(navigator.userAgent, destination);
  });
}
```

- [ ] **Step 4: Implement lazy music control**

Create `src/music.js`:

```js
import { SITE } from './config.js';

export function createMusicController({ audio, buttons }) {
  function sync() {
    buttons.forEach((button) => {
      const playing = !audio.paused;
      button.classList.toggle('is-playing', playing);
      button.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');
    });
  }

  async function play() {
    audio.volume = SITE.musicVolume;
    try { await audio.play(); } catch { /* Browsing continues without sound. */ }
    sync();
  }

  function toggle() {
    if (audio.paused) play();
    else { audio.pause(); sync(); }
  }

  buttons.forEach((button) => button.addEventListener('click', toggle));
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  return { play, toggle };
}
```

- [ ] **Step 5: Add music button animation CSS**

Append to `src/styles.css`:

```css
.music-button { position: absolute; top: max(1.25rem, env(safe-area-inset-top)); left: 1.25rem; z-index: 6; width: 2.2rem; height: 2.2rem; border: 1px solid rgba(255,255,255,.65); border-radius: 50%; background: rgba(31,42,34,.22); color: white; }
.music-button.is-playing { animation: music-spin 4s linear infinite; }
@keyframes music-spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 6: Wire music and native navigation into the app bootstrap**

Update `src/app.js` imports and controller setup:

```js
import { createMusicController } from './music.js';
import { bindNativeNavigation } from './navigation.js';

const music = createMusicController({
  audio: document.querySelector('[data-background-music]'),
  buttons: document.querySelectorAll('[data-music-toggle]')
});

createPagingController({
  root,
  openButton: document.querySelector('[data-open-invitation]'),
  onOpen: () => music.play()
});
bindNativeNavigation(document.querySelector('[data-native-navigation]'));
```

- [ ] **Step 7: Run tests**

Run: `npm test`

Expected: all unit tests PASS.

- [ ] **Step 8: Commit music and map integration**

```bash
git add src/app.js src/music.js src/navigation.js src/styles.css tests/unit/navigation.test.js
git commit -m "feat: add music and native navigation"
```

### Task 7: Add Desktop Gate, QR Code, And Responsive Polish

**Files:**
- Create: `src/desktop.js`
- Modify: `src/app.js`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement desktop gating and QR rendering**

Create `src/desktop.js`:

```js
import QRCode from 'qrcode';

export function setupDesktopGate() {
  const desktop = !window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches;
  const gate = document.querySelector('[data-desktop-gate]');
  const app = document.querySelector('[data-mobile-app]');
  if (!desktop) return false;

  app.hidden = true;
  document.querySelector('[data-loading]').hidden = true;
  gate.hidden = false;
  QRCode.toCanvas(gate.querySelector('[data-qr-code]'), window.location.href, {
    width: 220,
    margin: 1,
    color: { dark: '#44503f', light: '#e9e3d4' }
  });
  return true;
}
```

- [ ] **Step 2: Gate the mobile bootstrap before preloading assets**

Update `src/app.js` so desktop devices return before image and audio setup:

```js
import { setupDesktopGate } from './desktop.js';

const isDesktop = setupDesktopGate();
if (!isDesktop) {
  await Promise.all([
    preloadImages(CRITICAL_IMAGES, updateLoadingProgress),
    new Promise((resolve) => setTimeout(resolve, 1200))
  ]);
  loader.classList.add('is-complete');
  const music = createMusicController({
    audio: document.querySelector('[data-background-music]'),
    buttons: document.querySelectorAll('[data-music-toggle]')
  });
  createPagingController({
    root,
    openButton: document.querySelector('[data-open-invitation]'),
    onOpen: () => music.play()
  });
  bindNativeNavigation(document.querySelector('[data-native-navigation]'));
}
```

Keep the existing loading callback as a named function:

```js
function updateLoadingProgress(value) {
  bar.style.width = `${value}%`;
  percent.value = `${value}%`;
  percent.textContent = `${value}%`;
}
```

- [ ] **Step 3: Finish mobile page styling and desktop presentation**

Append the remaining required rules to `src/styles.css`:

```css
.day-watermark { position: absolute; top: 4rem; left: 1.1rem; z-index: 3; display: flex; align-items: end; gap: .55rem; color: white; opacity: .34; font-family: Didot, "Bodoni 72", serif; }
.day-watermark small { padding-bottom: .3rem; font-size: .95rem; letter-spacing: .25rem; }
.day-watermark b { font-size: 4.2rem; line-height: .72; font-weight: 400; font-style: italic; }
.location-stamp { position: absolute; top: 17%; left: 7%; z-index: 4; width: 80%; padding: .8rem 1rem; border: 0; border-left: 3px solid rgba(255,255,255,.88); background: rgba(31,42,34,.26); color: white; text-align: left; transform: rotate(-3deg); backdrop-filter: blur(4px); }
.inset-photo { position: absolute; top: 4rem; right: 1.2rem; z-index: 4; width: 36%; aspect-ratio: 3 / 4; object-fit: cover; border: 3px solid rgba(247,243,233,.9); transform: rotate(2deg); }
.packing-screen { background: var(--forest); color: var(--cream); }
.packing-screen ol { padding: 0; list-style-position: inside; border-top: 1px solid rgba(255,255,255,.3); }
.packing-screen li { padding: .8rem 0; border-bottom: 1px solid rgba(255,255,255,.3); }
.packing-screen li:first-child { color: var(--accent); font-weight: 700; }
.desktop-gate { min-height: 100vh; place-content: center; justify-items: center; gap: 1rem; background: var(--paper); color: var(--ink); text-align: center; }
.desktop-gate:not([hidden]) { display: grid; }
@media (min-width: 769px) { body { overflow: auto; } }
```

- [ ] **Step 4: Build and manually inspect both breakpoints**

Run: `npm run dev`

Expected:
- Mobile viewport shows the loading screen and invitation.
- Desktop viewport shows only the QR gate.
- No content overlaps safe areas or page copy.

- [ ] **Step 5: Commit desktop and responsive behavior**

```bash
git add src/app.js src/desktop.js src/styles.css
git commit -m "feat: add desktop QR gate and responsive polish"
```

### Task 8: Add End-To-End Interaction Tests

**Files:**
- Create: `tests/e2e/invitation.spec.js`
- Create: `tests/e2e/desktop.spec.js`

- [ ] **Step 1: Write the mobile interaction test**

Create `tests/e2e/invitation.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('invitation requires opening, supports paging, music, and relocking', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-loading]')).toBeHidden({ timeout: 5000 });
  const app = page.locator('[data-mobile-app]');
  await expect(app).toHaveClass(/is-locked/);

  await app.evaluate((element) => { element.scrollTop = element.clientHeight; });
  await expect(page.locator('[data-page="1"]')).toBeInViewport();

  await page.locator('[data-open-invitation]').click();
  await expect(page.locator('[data-page="2"]')).toBeInViewport({ timeout: 2500 });
  await expect(page.locator('[data-music-toggle]').first()).toHaveClass(/is-playing/);

  await page.locator('[data-music-toggle]').first().click();
  await expect(page.locator('[data-music-toggle]').first()).not.toHaveClass(/is-playing/);

  await app.evaluate((element) => element.scrollTo({ top: 0 }));
  await expect(app).toHaveClass(/is-locked/);
});

test('pages two through eight show hints and page nine does not', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-page="2"] .swipe-hint')).toHaveCount(1);
  await expect(page.locator('[data-page="8"] .swipe-hint')).toHaveCount(1);
  await expect(page.locator('[data-page="9"] .swipe-hint')).toHaveCount(0);
});
```

- [ ] **Step 2: Write the desktop gate test**

Create `tests/e2e/desktop.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('desktop hides itinerary and displays QR prompt', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-desktop-gate]')).toBeVisible();
  await expect(page.getByText('请使用手机打开')).toBeVisible();
  await expect(page.locator('[data-mobile-app]')).toBeHidden();
  await expect(page.locator('[data-qr-code]')).toBeVisible();
});
```

- [ ] **Step 3: Run mobile and desktop browser tests**

Run: `npm run test:e2e`

Expected: all Playwright tests PASS on mobile WebKit and desktop Chromium projects.

- [ ] **Step 4: Capture review screenshots**

Run:

```bash
npm run build
npm run preview -- --port 4173
```

In a second terminal, run:

```bash
npx playwright screenshot --device="iPhone 13" http://127.0.0.1:4173 artifacts/mobile-cover.png
npx playwright screenshot --viewport-size="1440,900" http://127.0.0.1:4173 artifacts/desktop-gate.png
```

Expected: screenshots are nonblank, correctly framed, and contain no overlapping text or controls.

- [ ] **Step 5: Commit browser tests**

```bash
git add tests/e2e playwright.config.js
git commit -m "test: cover invitation mobile and desktop flows"
```

### Task 9: Final Verification And Static Deployment Readiness

**Files:**
- Modify: `README.md`
- Verify: `dist/`

- [ ] **Step 1: Add build and deployment instructions**

Create `README.md`:

````markdown
# Team Retreat Invitation H5

Pure-static invitation for the July 15-16 product and engineering leadership retreat.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run test:e2e
npm run build
```

## Production Build

Set `VITE_PUBLIC_SITE_URL` to the final HTTPS directory URL, including the trailing slash, then run `npm run build`. Deploy the contents of `dist/` to any static host.
````

- [ ] **Step 2: Run the complete verification suite**

Run:

```bash
npm test
npm run test:e2e
npm run build
```

Expected:
- Unit tests PASS.
- Playwright tests PASS.
- Asset budget check PASS.
- `dist/` contains only static files.

- [ ] **Step 3: Inspect production output for forbidden backend behavior**

Run:

```bash
rg -n "fetch\(|XMLHttpRequest|WebSocket|/api/|axios" dist || true
find dist -type f | sort
```

Expected: no application API calls are present; output consists of HTML, CSS, JavaScript, images, audio, and static metadata.

- [ ] **Step 4: Verify final device-specific risks manually**

On one iPhone and one Android phone:

1. Open the public HTTPS URL.
2. Confirm no white screen appears.
3. Confirm the first page cannot be swiped forward before opening.
4. Tap the seal and confirm audio begins.
5. Pause and resume audio; confirm icon rotation matches playback.
6. Tap the destination and confirm the system map receives the full address.
7. Share through the system share menu and inspect the WeChat card.

- [ ] **Step 5: Commit release documentation**

```bash
git add README.md
git commit -m "docs: add build and deployment guide"
```

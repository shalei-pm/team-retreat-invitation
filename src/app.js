import { CRITICAL_IMAGES, SITE } from './config.js';
import { setupDesktopGate } from './desktop.js';
import { createMusicController } from './music.js';
import { bindNativeNavigation } from './navigation.js';
import { createPagingController } from './paging.js';
import { preloadImages } from './preloader.js';

const root = document.querySelector('[data-mobile-app]');
const loader = document.querySelector('[data-loading]');
const bar = document.querySelector('[data-loading-bar]');
const percent = document.querySelector('[data-loading-percent]');

document.querySelectorAll('.screen-media').forEach((media) => {
  media.style.backgroundImage = `url("${new URL(media.dataset.placeholder, document.baseURI).href}")`;
  const image = media.querySelector('img');
  const markLoaded = () => image.classList.add('is-loaded');
  if (image.complete) markLoaded();
  else image.addEventListener('load', markLoaded, { once: true });
});

if (!setupDesktopGate()) {
  await Promise.all([
    preloadImages(CRITICAL_IMAGES, updateLoadingProgress),
    new Promise((resolve) => setTimeout(resolve, 1200))
  ]);
  updateLoadingProgress(100);
  loader.classList.add('is-complete');

  const music = createMusicController({
    audio: document.querySelector('[data-background-music]'),
    buttons: document.querySelectorAll('[data-music-toggle]')
  });

  createPagingController({
    root,
    openButton: document.querySelector('[data-open-invitation]'),
    totalPages: SITE.totalPages,
    onOpen: () => music.play()
  });

  bindNativeNavigation(document.querySelector('[data-native-navigation]'));
}

function updateLoadingProgress(value) {
  bar.style.width = `${value}%`;
  percent.value = `${value}%`;
  percent.textContent = `${value}%`;
}

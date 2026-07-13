import { SITE } from './config.js';

export function musicUiState(paused) {
  return paused
    ? { playing: false, label: '播放背景音乐' }
    : { playing: true, label: '暂停背景音乐' };
}

export function createMusicController({ audio, buttons }) {
  function sync() {
    const state = musicUiState(audio.paused);
    buttons.forEach((button) => {
      button.classList.toggle('is-playing', state.playing);
      button.setAttribute('aria-label', state.label);
    });
  }

  async function play() {
    audio.volume = SITE.musicVolume;
    try {
      await audio.play();
    } catch {
      audio.pause();
    }
    sync();
  }

  function toggle(event) {
    event?.stopPropagation();
    if (audio.paused) play();
    else {
      audio.pause();
      sync();
    }
  }

  buttons.forEach((button) => button.addEventListener('click', toggle));
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  sync();
  return { play, toggle };
}

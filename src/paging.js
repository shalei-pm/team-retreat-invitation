import { initialState, reduceInvitation } from './state.js';

export function pageFromScroll(scrollTop, pageHeight, totalPages) {
  if (pageHeight <= 0) return 1;
  return Math.min(totalPages, Math.max(1, Math.round(scrollTop / pageHeight) + 1));
}

export function createPagingController({ root, openButton, totalPages, onOpen }) {
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
    state = reduceInvitation(state, {
      type: 'PAGE_CHANGED',
      page: pageFromScroll(root.scrollTop, root.clientHeight, totalPages)
    });
    render();
  }, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('has-entered');
      observer.unobserve(entry.target);
    }
  }, { root, threshold: 0.55 });

  root.querySelectorAll('.screen').forEach((screen) => observer.observe(screen));
  render();
}

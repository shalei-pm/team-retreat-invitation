export const initialState = Object.freeze({
  unlocked: false,
  opening: false,
  currentPage: 1
});

export function reduceInvitation(state, event) {
  switch (event.type) {
    case 'OPEN':
      return { ...state, unlocked: true, opening: true };
    case 'OPEN_ANIMATION_FINISHED':
      return {
        ...state,
        opening: false
      };
    case 'PAGE_CHANGED':
      return {
        ...state,
        currentPage: event.page
      };
    case 'ENVELOPE_REACHED':
      return state.opening
        ? state
        : { ...state, currentPage: 1, unlocked: false };
    default:
      return state;
  }
}

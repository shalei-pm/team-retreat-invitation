import { SITE } from './config.js';

export function navigationUrl(userAgent, destination) {
  const encoded = encodeURIComponent(destination);
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return `https://maps.apple.com/?daddr=${encoded}&dirflg=d`;
  }
  if (/Android/i.test(userAgent)) {
    return `geo:0,0?q=${encoded}`;
  }
  return `https://maps.apple.com/?q=${encoded}`;
}

export function bindNativeNavigation(button) {
  const destination = `${SITE.destinationName}，${SITE.destinationAddress}`;
  button.addEventListener('click', () => {
    window.location.href = navigationUrl(navigator.userAgent, destination);
  });
}

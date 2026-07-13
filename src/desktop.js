import QRCode from 'qrcode';

export function shouldUseDesktopGate(matchesMobileQuery) {
  return !matchesMobileQuery;
}

export function setupDesktopGate() {
  const matchesMobile = window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches;
  if (!shouldUseDesktopGate(matchesMobile)) return false;

  const gate = document.querySelector('[data-desktop-gate]');
  const app = document.querySelector('[data-mobile-app]');
  const loader = document.querySelector('[data-loading]');
  app.hidden = true;
  loader.hidden = true;
  gate.hidden = false;

  QRCode.toCanvas(gate.querySelector('[data-qr-code]'), window.location.href, {
    width: 220,
    margin: 1,
    color: { dark: '#44503f', light: '#e9e3d4' }
  });
  return true;
}

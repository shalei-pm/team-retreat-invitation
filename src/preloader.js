export function progressPercent(loaded, total) {
  if (total <= 0) return 100;
  return Math.min(100, Math.round((loaded / total) * 100));
}

export function resolveAssetUrl(path, baseUrl = globalThis.document?.baseURI ?? 'http://localhost/') {
  return new URL(path, baseUrl).href;
}

export async function preloadImages(urls, onProgress, options = {}) {
  const ImageCtor = options.ImageCtor ?? globalThis.Image;
  const baseUrl = options.baseUrl ?? globalThis.document?.baseURI;
  let loaded = 0;

  await Promise.all(urls.map((path) => new Promise((resolve) => {
    const image = new ImageCtor();
    image.onload = image.onerror = () => {
      loaded += 1;
      onProgress(progressPercent(loaded, urls.length));
      resolve();
    };
    image.src = resolveAssetUrl(path, baseUrl);
  })));
}

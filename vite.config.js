import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = env.VITE_PUBLIC_SITE_URL || 'http://localhost:4173/';

  return {
    base: './',
    plugins: [{
      name: 'inject-public-site-url',
      transformIndexHtml(html) {
        return html.replaceAll('__PUBLIC_SITE_URL__', siteUrl);
      }
    }]
  };
});

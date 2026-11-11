// @ts-check
import { defineConfig } from 'astro/config';

// Web estática: cualquier hosting (Vercel, Hostinger) la publica sin servidor.
export default defineConfig({
  site: 'https://moranogruppo.com',
  output: 'static',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: { inlineStylesheets: 'never' },
  prefetch: false,
  devToolbar: { enabled: false },
  vite: { build: { assetsInlineLimit: 0 } },
});

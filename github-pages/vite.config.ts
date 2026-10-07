import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
export default defineConfig({
  root: root + '/github-pages',
  base: process.env.PAGES_BASE || './',
  publicDir: root + '/public',
  plugins: [react()],
  resolve: { alias: { '@': root } },
  define: {
    __WORDQUEST_BASE__: JSON.stringify(process.env.PAGES_BASE || './'),
    __WORDQUEST_STATIC__: 'true',
  },
  css: { postcss: root },
  build: { outDir: root + '/dist-pages', emptyOutDir: true },
});

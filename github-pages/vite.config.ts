import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
// Reassemble the lesson video from small uploadable files before Vite copies public assets.
const mediaDir = root + '/lesson-media/pu1-u9-landscapes';
const mediaManifest = JSON.parse(readFileSync(mediaDir + '/manifest.json', 'utf8')) as {parts:string[];sha256:string};
const video = Buffer.concat(mediaManifest.parts.map(part=>readFileSync(mediaDir + '/' + part)));
if (createHash('sha256').update(video).digest('hex') !== mediaManifest.sha256) throw new Error('Landscape video is incomplete');
mkdirSync(root + '/public/lessons/pu1-u9-cross-curricular', {recursive:true});
writeFileSync(root + '/public/lessons/pu1-u9-cross-curricular/video.mp4', video);
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

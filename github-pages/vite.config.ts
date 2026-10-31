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
// Lesson 2 media is split only for repository transfer; browsers receive normal media files.
const unit7MediaDir=root+'/lesson-media/pu1-u7-lesson2';
const unit7Media=JSON.parse(readFileSync(unit7MediaDir+'/manifest.json','utf8')) as {assets:{file:string;sha256:string;parts:string[]}[]};
for(const asset of unit7Media.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(unit7MediaDir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Unit 7 Lesson 2 media is incomplete');
 mkdirSync(root+'/public/lessons/pu1-u7-lesson2',{recursive:true});
 writeFileSync(root+'/public/lessons/pu1-u7-lesson2/'+asset.file,data);
}
// Original Lesson 3 recordings and chant, reconstructed for normal browser playback.
const lesson3Dir=root+'/lesson-media/pu1-u7-lesson3';
const lesson3Media=JSON.parse(readFileSync(lesson3Dir+'/manifest.json','utf8')) as {assets:{file:string;sha256:string;parts:string[]}[]};
for(const asset of lesson3Media.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(lesson3Dir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Unit 7 Lesson 3 media is incomplete');
 mkdirSync(root+'/public/lessons/pu1-u7-lesson3',{recursive:true});
 writeFileSync(root+'/public/lessons/pu1-u7-lesson3/'+asset.file,data);
}
// Lesson 4's original workout video and warm-up recording.
const lesson4Dir=root+'/lesson-media/pu1-u7-lesson4';
const lesson4Media=JSON.parse(readFileSync(lesson4Dir+'/manifest.json','utf8')) as {assets:{file:string;sha256:string;parts:string[]}[]};
for(const asset of lesson4Media.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(lesson4Dir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Unit 7 Lesson 4 media is incomplete');
 mkdirSync(root+'/public/lessons/pu1-u7-lesson4',{recursive:true});
 writeFileSync(root+'/public/lessons/pu1-u7-lesson4/'+asset.file,data);
}
// Lesson 5 original story and workbook recordings.
const lesson5Dir=root+'/lesson-media/pu1-u7-lesson5';
const lesson5Media=JSON.parse(readFileSync(lesson5Dir+'/manifest.json','utf8')) as {assets:{file:string;sha256:string;parts:string[]}[]};
for(const asset of lesson5Media.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(lesson5Dir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Unit 7 Lesson 5 media is incomplete');
 mkdirSync(root+'/public/lessons/pu1-u7-lesson5',{recursive:true});
 writeFileSync(root+'/public/lessons/pu1-u7-lesson5/'+asset.file,data);
}
// Unit 8 Lesson 2 original story, rap and listening recordings.
const u8l2Dir=root+'/lesson-media/pu1-u8-lesson2';
const u8l2Media=JSON.parse(readFileSync(u8l2Dir+'/manifest.json','utf8')) as {assets:{file:string;sha256:string;parts:string[]}[]};
for(const asset of u8l2Media.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(u8l2Dir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Unit 8 Lesson 2 media is incomplete');
 mkdirSync(root+'/public/lessons/pu1-u8-lesson2',{recursive:true});
 writeFileSync(root+'/public/lessons/pu1-u8-lesson2/'+asset.file,data);
}
// Unit 8 lessons 3–5: reconstruct compact classroom videos from repository parts.
const unit8NewDir=root+'/lesson-media/pu1-u8-new';
const unit8NewMedia=JSON.parse(readFileSync(unit8NewDir+'/manifest.json','utf8')) as {assets:{directory:string;file:string;sha256:string;parts:string[]}[]};
for(const asset of unit8NewMedia.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(unit8NewDir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Unit 8 lesson media is incomplete');
 mkdirSync(root+'/public/lessons/'+asset.directory,{recursive:true});
 writeFileSync(root+'/public/lessons/'+asset.directory+'/'+asset.file,data);
}
// Unit 2 family lesson: reconstruct original lesson videos for browser playback.
const unit2Dir=root+'/lesson-media/pu1-u2-vocabulary1';
const unit2Media=JSON.parse(readFileSync(unit2Dir+'/manifest.json','utf8')) as {assets:{file:string;sha256:string;parts:string[]}[]};
for(const asset of unit2Media.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(unit2Dir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Unit 2 lesson media is incomplete');
 mkdirSync(root+'/public/lessons/pu1-u2-vocabulary1',{recursive:true});
 writeFileSync(root+'/public/lessons/pu1-u2-vocabulary1/'+asset.file,data);
}
// Unit 2 Lesson 2 original story video and listening recordings.
const unit2StoryDir=root+'/lesson-media/pu1-u2-lesson2';
const unit2StoryMedia=JSON.parse(readFileSync(unit2StoryDir+'/manifest.json','utf8')) as {assets:{file:string;sha256:string;parts:string[]}[]};
for(const asset of unit2StoryMedia.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(unit2StoryDir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Unit 2 story media is incomplete');
 mkdirSync(root+'/public/lessons/pu1-u2-lesson2',{recursive:true});
 writeFileSync(root+'/public/lessons/pu1-u2-lesson2/'+asset.file,data);
}
// Beehive 1 Unit 4: original videos and nineteen listening tracks.
const beehiveDir=root+'/lesson-media/beehive1-u4';
const beehiveMedia=JSON.parse(readFileSync(beehiveDir+'/manifest.json','utf8')) as {assets:{file:string;sha256:string;parts:string[]}[]};
for(const asset of beehiveMedia.assets){
 const data=Buffer.concat(asset.parts.map(part=>readFileSync(beehiveDir+'/'+part)));
 if(createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Beehive Unit 4 media is incomplete');
 mkdirSync(root+'/public/lessons/beehive1-u4',{recursive:true});
 writeFileSync(root+'/public/lessons/beehive1-u4/'+asset.file,data);
}
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

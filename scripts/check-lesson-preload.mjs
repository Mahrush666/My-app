import fs from 'node:fs';import assert from 'node:assert/strict';import{build}from'esbuild';
const dir='.wrangler/lesson-preload/';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(dir+'core.ts',`export{lessons}from'../../github-pages/lessons';export{lessonMediaFiles}from'../../lib/lesson-media';export{preloadLessonMedia}from'../../lib/preload-lesson-media';export{preloadedMediaUrl,retainMedia,releaseMedia,rememberMedia}from'../../lib/media-memory';export{publicAsset}from'../../lib/public-runtime';export{audioSource}from'../../lib/audio';`);
await build({entryPoints:[dir+'core.ts'],bundle:true,format:'esm',platform:'node',outfile:dir+'core.mjs',define:{__WORDQUEST_BASE__:'"/My-app/"'}});
const{lessons,lessonMediaFiles,preloadLessonMedia,preloadedMediaUrl,releaseMedia,rememberMedia,publicAsset,audioSource}=await import('../'+dir+'core.mjs');
let total=0;for(const lesson of lessons){const files=lessonMediaFiles(lesson);assert.equal(new Set(files.map(f=>f.src)).size,files.length);for(const file of files){assert(fs.existsSync('public/'+file.src.slice('/My-app/'.length)),lesson.id+': missing '+file.src);assert(!/\.(mp4|webm|mov)([?#]|$)/i.test(file.src),'Video included: '+file.src)}total+=files.length;}
const weather=lessonMediaFiles(lessons.find(l=>l.id==='pu-starter-u8-lesson6'));
assert(weather.some(f=>f.src===audioSource('How’s the weather?')));assert(weather.some(f=>f.src===audioSource('It’s sunny.')));assert(weather.some(f=>f.kind==='audio'&&f.src.includes('/lessons/')),'Original lesson audio included');
const volcano=lessonMediaFiles(lessons.find(l=>l.id==='play2-u4-lesson3'));assert.equal(volcano.filter(f=>f.src.includes('/story-art/part-')).length,15);assert(volcano.some(f=>f.src.endsWith('/volcano-powder.webp')));
const phonics=lessonMediaFiles(lessons.find(l=>l.id==='smart-phonics2-u3'));assert(phonics.some(f=>f.src===audioSource('cat')),'Phonics audio distractors from earlier lessons included');
const originalFetch=globalThis.fetch,wait=()=>new Promise(r=>setTimeout(r,0));
let calls=[],inFlight=0,maximum=0,fail=true;
globalThis.fetch=async(src,{signal})=>{calls.push(src);inFlight++;maximum=Math.max(maximum,inFlight);await wait();inFlight--;if(src.endsWith('bad')&&fail)return new Response('missing',{status:404});return new Response('complete media data',{headers:{'content-type':'audio/mp4'}})};
try{
 const controller=new AbortController(),user=Symbol(),files=Array.from({length:9},(_,i)=>({src:'/test/'+i,kind:'audio'}));files.push({src:'/test/bad',kind:'image'});
 const progress=[],result=await preloadLessonMedia(files,user,controller.signal,p=>progress.push(p));assert.equal(maximum,4);assert.equal(result.loaded,9);assert.equal(result.failed,1);assert(preloadedMediaUrl('/test/0').startsWith('blob:'));assert.equal(preloadedMediaUrl('/test/bad'),'/test/bad');assert.equal(await(await originalFetch(preloadedMediaUrl('/test/0'))).text(),'complete media data','Entire response is available locally');
 fail=false;calls=[];const retried=await preloadLessonMedia(files,user,controller.signal,()=>{});assert.equal(retried.failed,0);assert.deepEqual(calls,['/test/bad'],'Retry only downloads missing files');
 const second=Symbol();calls=[];await preloadLessonMedia(files,second,controller.signal,()=>{});assert.equal(calls.length,0,'Reopening a warm lesson reuses complete downloads');releaseMedia(user);
 // Stopping the lesson aborts pending fetches and never publishes late responses.
 let aborted=0;globalThis.fetch=(src,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>{aborted++;reject(new Error('cancelled'))},{once:true}));
 const cancel=new AbortController(),c=Symbol();const pending=preloadLessonMedia([{src:'/cancel',kind:'audio'}],c,cancel.signal,()=>{});cancel.abort();await pending;releaseMedia(c);assert.equal(aborted,1);assert.equal(preloadedMediaUrl('/cancel'),'/cancel');
 // The public resolver used by real images and speech returns the prepared file.
 rememberMedia('/My-app/lessons/test.webp',new Blob(['picture']),second);assert(publicAsset('lessons/test.webp').startsWith('blob:'));assert(publicAsset('lessons/not-loaded.webp').startsWith('/My-app/'));
 releaseMedia(second);
 console.log('PASS:',lessons.length,'lesson manifests,',total,'image/audio references; no video; weather question/answers, all 15 Story pictures, mission art and phonics choices; full downloads, four-request limit, retry/reuse, cancellation and playback URLs');
}finally{globalThis.fetch=originalFetch}

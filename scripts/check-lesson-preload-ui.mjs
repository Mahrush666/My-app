import fs from 'node:fs';import assert from 'node:assert/strict';import{build}from'esbuild';import{createRequire}from'node:module';
const dir='.wrangler/lesson-preload/';
fs.writeFileSync(dir+'ui.tsx',`import React from'react';import{createRoot}from'react-dom/client';import Practice from'../../app/practice';const w=window as any;const root=createRoot(document.getElementById('root')!);w.events=[];const one={id:'cat',en:'cat',sentence:'The cat is small.',zh:'猫',icon:'',category:'Animals',picture:'lessons/test/cat.webp'};w.show=(other=false)=>root.render(<Practice key={other?'other':'lesson'} vocabulary={[one]} readings={[]} activities={['look-listen']} mediaLesson={{words:[one,{...one,id:'dog',en:'dog',picture:'lessons/test/dog.webp'}],readings:[],videos:[{title:'Song',src:'test-video.mp4',poster:'lessons/test/poster.webp'},{title:'Audio',src:'lessons/test/original.mp3',audioOnly:true}]}} onMediaReady={ready=>w.events.push(ready)}/>);w.show();`);
await build({entryPoints:[dir+'ui.tsx'],bundle:true,format:'iife',platform:'browser',outfile:dir+'ui.js',define:{'process.env.NODE_ENV':'"production"'}});
const{Window}=createRequire(new URL('../.wrangler/qr-qa/package.json',import.meta.url))('happy-dom');const w=new Window({url:'https://example.com',width:390,height:844,settings:{enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}}),wait=()=>new Promise(r=>setTimeout(r,50));
let pending=[],requests=[],fail=true;const blobs=new Map();w.URL.createObjectURL=blob=>{const url='blob:https://example.com/'+blobs.size;blobs.set(url,blob);return url};w.URL.revokeObjectURL=url=>blobs.delete(url);
w.HTMLMediaElement.prototype.play=async function(){w.played=this.src};w.HTMLMediaElement.prototype.pause=function(){};
w.fetch=(src,{signal}={})=>new Promise((resolve,reject)=>{requests.push(String(src));pending.push(()=>{if(signal?.aborted)return reject(new w.Error('Cancelled'));resolve({ok:!(fail&&src.endsWith('dog.webp')),headers:{get:()=>null},blob:async()=>new w.Blob(['complete-file'])})});signal?.addEventListener('abort',()=>reject(new w.Error('Cancelled')),{once:true})});
async function flush(){for(let i=0;i<30;i++){const batch=pending.splice(0);batch.forEach(fn=>fn());await wait();if(!pending.length&&w.document.querySelector('.lesson-assets')?.getAttribute('aria-busy')==='false')return;if(w.document.querySelector('[role=tab]'))return}}
try{
 w.document.body.innerHTML='<div id="root"></div>';w.eval(fs.readFileSync(dir+'ui.js','utf8'));await wait();assert.equal(w.events.at(-1),false);assert(w.document.querySelector('.lesson-assets'));assert.equal(w.document.querySelector('[role=tab]'),null,'Practice waits until media is downloaded');assert.equal(pending.length,4);
 pending.splice(0).forEach(fn=>fn());await wait();assert.equal(w.document.querySelector('[role=tab]'),null,'A few completed files do not open practice early');
 await flush();assert(w.document.querySelector('[role=tab]'),'An unavailable image does not keep the lesson closed');assert.equal(w.events.at(-1),true);
 assert(requests.some(src=>src.endsWith('dog.webp')),'Background preload still includes the full lesson');assert(requests.some(src=>src.endsWith('original.mp3')));assert(!requests.some(src=>src.endsWith('.mp4')),'Videos never preloaded');
 const img=w.document.querySelector('.picture-prompt img');assert(img.src.startsWith('blob:'),'Exercise uses preloaded image');const count=requests.length;w.document.querySelector('.action-listen').click();await wait();assert(w.played.startsWith('blob:'),'Spoken audio uses preloaded bytes');assert.equal(requests.length,count,'No second download on audio click');
 const nativeTimeout=w.setTimeout.bind(w);
 let openAfterBudget;
 w.setTimeout=(callback,ms,...args)=>{if(ms===4000){openAfterBudget=callback;return nativeTimeout(()=>{},4000)}return nativeTimeout(callback,ms,...args)};
 fail=false;w.show(true);await wait();assert(w.document.querySelector('.lesson-assets'));assert.equal(requests.length-count,1,'Reopening only downloads the file that failed');
 assert(openAfterBudget,'The startup timer is independent of the download queue');openAfterBudget();await wait();
 assert(w.document.querySelector('[role=tab]'),'Practice opens after the startup budget with a download still stalled');
 assert.equal(w.events.at(-1),true);await flush();
 console.log('PASS: bounded lesson startup, non-blocking failed images, background media, local audio playback, and cached files reused.');
}finally{await w.happyDOM.close()}

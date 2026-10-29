import fs from 'node:fs';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
const {Window}=createRequire(new URL('../.wrangler/qr-qa/package.json',import.meta.url))('happy-dom');
const dir='.wrangler/gogo-qa/';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(dir+'entry.tsx',`import React from 'react';import {createRoot} from 'react-dom/client';import DailyAdventure from '../../github-pages/daily-adventure';import {gogoStage,gogoMeals} from '../../github-pages/gogo-practice';let root;window.mountDaily=()=>{root=createRoot(document.getElementById('root'));root.render(<DailyAdventure childId="student-test" request={window.request} onExit={()=>window.exitCount++}/>)};window.unmountDaily=()=>root.unmount();window.gogoStage=gogoStage;window.gogoMeals=gogoMeals;window.mountDaily();`);
await build({entryPoints:[dir+'entry.tsx'],bundle:true,format:'iife',platform:'browser',jsx:'automatic',outfile:dir+'ui.js',define:{'process.env.NODE_ENV':'"production"'}});
const w=new Window({url:'https://example.com/My-app/',settings:{enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
const wait=()=>new Promise(r=>setTimeout(r,35));
const button=text=>[...w.document.querySelectorAll('button')].find(b=>b.textContent.includes(text));
const allTasks=Array.from({length:12},(_,i)=>({id:'q'+i,assignmentId:'assigned',unitId:'unit',activity:'word-choice',wordId:'cat-'+i,kind:'written',expected:'cat',prompt:'Choose the word '+i,options:['cat','dog','cow','ham'].map(text=>({id:text,text}))}));
let run={id:'today',enabled:true,day:'2026-10-29',tasks:allTasks,done:[],finished:false},answers=0,loaded=[];
w.exitCount=0;
w.request=async(path,data)=>{if(path.includes('answer')){answers++;const correct=data.answer===run.tasks.find(t=>t.id===data.taskId).expected;if(correct&&!run.done.includes(data.taskId))run.done.push(data.taskId);run.finished=run.done.length===run.tasks.length;return structuredClone({...run,correct})}return structuredClone(run)};
w.HTMLMediaElement.prototype.play=async()=>{};w.HTMLMediaElement.prototype.pause=()=>{};
let objectId=0,releaseFirst;const firstDownload=new Promise(resolve=>releaseFirst=resolve),cache=new Map();
w.URL.createObjectURL=()=>`blob:artwork-${++objectId}`;w.URL.revokeObjectURL=()=>{};
w.Image=class{set src(value){this._src=value;if(value)w.setTimeout(()=>this.onload?.(),0)}get src(){return this._src}};
const response=()=>({ok:true,blob:async()=>new w.Blob(['test artwork'],{type:'image/webp'}),clone:()=>response()});
w.caches={open:async()=>({match:async key=>cache.get(key)?.clone(),put:async(key,value)=>{cache.set(key,value.clone())}})};
const fetchArtwork=async src=>{loaded.push(src);if(src.endsWith('/pizza.webp'))await firstDownload;return response()};w.fetch=fetchArtwork;
const nativeTimeout=w.setTimeout.bind(w);w.setTimeout=(cb,ms,...rest)=>nativeTimeout(cb,(ms>=650&&ms<6000)?2:ms,...rest);
w.document.body.innerHTML='<div id="root"></div>';w.eval(fs.readFileSync(dir+'ui.js','utf8'));await wait();
assert.ok(button('Feed Gogo!'));assert.ok(button('Archer Adventure'));assert.equal(w.document.querySelector('.daily-challenge'),null);
assert.equal(answers,0,'Choosing a mode never earns progress');button('Feed Gogo!').click();await wait();
assert.ok(w.document.querySelector('.gogo-loading'),'Loading screen is shown before gameplay');assert.equal(w.document.querySelector('.daily-challenge'),null);assert.equal(answers,0);assert.ok(w.document.querySelector('.gogo-loading progress').value<24,'Progress never claims completion while a file is still downloading');
releaseFirst();for(let i=0;i<15&&!w.document.querySelector('.gogo-practice');i++)await wait();
assert.ok(w.document.querySelector('.gogo-practice'));assert.equal(w.document.querySelector('.daily-mode-picker'),null,'No mid-session mode switch');
assert.equal(loaded.length,24,'All twelve stages, eleven meals and idle animation load before play');const initialDownloads=loaded.length;
button('dog').click();await wait();button('OK ✓').click();await wait();assert.equal(run.done.length,0);assert.equal(w.document.querySelector('.gogo-feeding'),null,'Mistakes never feed Gogo');assert.match(w.document.body.textContent,/try again/);
// Save part of the day, then refresh into the same game with the same progress.
async function answer(text){button(text).click();await wait();const ok=button('OK ✓');ok.click();ok.click();await wait()}
async function finishFeed(){const image=w.document.querySelector('.gogo-animation');if(image)image.dispatchEvent(new w.Event('load'));await wait();await wait()}
await answer('cat');assert.equal(run.done.length,1);assert.ok(w.document.querySelector('.gogo-feeding'));assert.equal(w.document.querySelector('.daily-challenge'),null,'Next question waits for the feeding animation');await finishFeed();assert.ok(w.document.querySelector('.daily-challenge'));
w.unmountDaily();await wait();w.mountDaily();await wait();await wait();assert.ok(w.document.querySelector('.gogo-practice'),'Refresh resumes the chosen game');assert.equal(w.document.querySelector('.gogo-progress progress').value,1);assert.equal(w.document.querySelector('.daily-mode-picker'),null);assert.equal(loaded.length,initialDownloads,'Refresh reads retained artwork without network downloads');
for(let i=1;i<12;i++){await answer('cat');assert.equal(run.done.length,i+1);if(i===11)assert.equal(w.document.querySelector('.daily-finished'),null,'Final celebration waits for the last feeding');await finishFeed()}
assert.equal(answers,13,'Only one saved answer per OK tap, including the incorrect attempt');assert.ok(w.document.querySelector('.daily-finished'));assert.ok(w.document.querySelector('img[alt="Full, happy Gogo giving two thumbs up"]').src.startsWith('blob:'));assert.equal(w.document.querySelector('.daily-challenge'),null);assert.equal(loaded.length,initialDownloads,'All twelve feeding animations play entirely from memory');
assert.deepEqual(Array.from({length:13},(_,i)=>w.gogoStage(i)),[1,2,3,4,5,6,6,7,8,9,10,11,12]);
for(const food of w.gogoMeals.filter(m=>m!=='cookie'))assert.ok(loaded.some(s=>s.endsWith('/'+food+'.webp')),food+' animation is used');
button('Practise again').click();await wait();assert.ok(button('Archer Adventure'));assert.ok(button('Feed Gogo!'));button('Feed Gogo!').click();await wait();await wait();await answer('cat');await finishFeed();assert.equal(answers,13,'Replay never writes extra homework attempts or rewards');
w.unmountDaily();await wait();run={...run,id:'formats',done:[],finished:false,tasks:[{...allTasks[0],id:'picture',kind:'pictures',expected:'cat',listen:'cat',options:allTasks[0].options.map(o=>({...o,image:'test/'+o.text+'.webp'}))},{...allTasks[1],id:'audio',kind:'audio-options',image:'test/cat.webp'},{...allTasks[2],id:'letters',kind:'letters',expected:'cat'},{...allTasks[3],id:'sentence',kind:'sentence',expected:'She has short hair'}]};
w.mountDaily();await wait();button('Feed Gogo!').click();await wait();await wait();assert.ok(loaded.some(src=>src.endsWith('test/cat.webp')),'Question pictures are also preloaded');
const picture=w.document.querySelector('.daily-pictures button');assert.equal(picture.querySelector('img').getAttribute('alt'),'','Pictures never reveal the written answer');picture.click();await wait();button('OK ✓').click();await wait();await finishFeed();
const sound=w.document.querySelector('.daily-options button');assert.match(sound.textContent,/🔊 1/);assert.ok(!sound.textContent.includes('cat'),'Audio choices do not show written answers');sound.click();await wait();button('OK ✓').click();await wait();await finishFeed();
for(const expected of ['cat','She has short hair']){const parts=expected.includes(' ')?expected.split(' '):[...expected];for(const part of parts){const tile=[...w.document.querySelectorAll('.spelling-tiles button')].find(b=>b.textContent===part&&!b.disabled);assert.ok(tile);tile.click();await wait()}button('OK ✓').click();await wait();await finishFeed()}
assert.ok(w.document.querySelector('.daily-finished'));
// A failed save cannot feed the monster; failed artwork blocks play and can be retried.
w.unmountDaily();await wait();run={...run,id:'offline-assets',tasks:allTasks,done:[],finished:false};
const api=w.request;let failSave=true;w.request=async(path,data)=>{if(path.includes('answer')&&failSave){failSave=false;throw Error('Please try saving again')}return api(path,data)};cache.clear();w.fetch=async()=>{throw Error('Image unavailable')};
w.mountDaily();await wait();button('Feed Gogo!').click();await wait();assert.ok(button('Try again'));assert.equal(w.document.querySelector('.daily-challenge'),null,'Gameplay waits until every file loads');assert.equal(run.done.length,0);w.fetch=fetchArtwork;button('Try again').click();for(let i=0;i<15&&!w.document.querySelector('.gogo-practice');i++)await wait();
await answer('cat');assert.equal(run.done.length,0);assert.match(w.document.body.textContent,/Please try saving again/);assert.equal(w.document.querySelector('.gogo-feeding'),null);
await answer('cat');await finishFeed();assert.equal(run.done.length,1);assert.ok(w.document.querySelector('.daily-challenge'));
w.document.querySelector('.gogo-exit').click();await wait();assert.equal(w.exitCount,1);await w.happyDOM.close();
for(const name of [...Array.from({length:12},(_,i)=>`stage-${String(i+1).padStart(2,'0')}.webp`),'idle.webp',...Object.keys(JSON.parse(fs.readFileSync('public/mascots/gogo/manifest.json'))).filter(n=>n!=='idle').map(n=>n+'.webp')])assert.ok(fs.existsSync('public/mascots/gogo/'+name));
console.log('PASS: full artwork preload before play, loading progress, persistent cache reuse, no artwork downloads during 12 feeds, failed-download retry, mode choice, save/resume, and all question formats.');

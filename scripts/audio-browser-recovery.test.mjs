import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source=readFileSync(new URL('../lib/audio.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function browser(){
 const window=new EventTarget(),document=new EventTarget(),audios=[],errors=[],timers=new Map();
 document.visibilityState='visible';document.body={appendChild(){}};
 class Audio extends EventTarget {
  paused=true;ended=false;currentTime=0;src='';playCalls=0;
  constructor(){super();audios.push(this);}
  getAttribute(name){return name==='src'?this.src:null;}
  play(){this.playCalls++;this.paused=false;return this.result||Promise.resolve();}
  pause(){this.paused=true;}
  remove(){}
 }
 class CustomEvent extends Event {constructor(type,options={}){super(type);this.detail=options.detail;}}
 window.addEventListener('wordquest-audio-error',e=>errors.push(e.detail));
 let timerId=0;
 const exports={};
 vm.runInNewContext(compiled,{exports,require:path=>path.endsWith('public-runtime')?{publicAsset:p=>'/'+p}:{},window,document,Audio,CustomEvent,setTimeout:(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)});
 return {api:exports,window,document,audios,errors,timers,hide(){document.visibilityState='hidden';document.dispatchEvent(new Event('visibilitychange'));},show(){document.visibilityState='visible';document.dispatchEvent(new Event('visibilitychange'));}};
}
test('switching apps stops current audio and does not replay it on return',()=>{
 const b=browser();b.api.speak('cat','cat.mp3');const audio=b.audios[0];
 audio.dispatchEvent(new Event('playing'));b.hide();b.show();
 assert.equal(audio.paused,true);assert.equal(audio.playCalls,1);
 assert.equal(b.errors.length,1);assert.equal(b.errors[0].src,'/cat.mp3');
 assert.equal(b.timers.size,0);
 b.api.speak('cat','cat.mp3');assert.equal(b.audios[1].playCalls,1);
});
test('late rejection from an older question cannot show an error over a new question',async()=>{
 const b=browser();let reject;
 b.api.speak('old','old.mp3');const old=b.audios[0];
 // Start a second attempt whose play promise rejects after the next question.
 old.result=new Promise((_,r)=>{reject=r;});
 b.api.stopSpeaking();
 // A new Audio receives the pending promise through the prototype for this call.
 const proto=Object.getPrototypeOf(old);proto.result=old.result;
 b.api.speak('old','old.mp3');delete proto.result;
 b.api.speak('new','new.mp3');reject(new Error('interrupted'));await Promise.resolve();
 assert.equal(b.errors.length,0);assert.equal(b.audios.at(-1).src,'/new.mp3');
});
test('a stalled start offers fallback and suppresses late unexpected playback',()=>{
 const b=browser();b.api.speak('cat','cat.mp3');const audio=b.audios[0];
 const timer=[...b.timers.values()].find(t=>t.ms===12000);assert.ok(timer);timer.fn();
 assert.equal(b.errors.length,1);assert.equal(audio.paused,true);
 audio.paused=false;audio.dispatchEvent(new Event('playing'));
 assert.equal(audio.paused,true);
});
test('media load errors offer fallback once',()=>{
 const b=browser();b.api.speak('cat','cat.mp3');const audio=b.audios[0];
 audio.dispatchEvent(new Event('error'));audio.dispatchEvent(new Event('error'));
 assert.equal(b.errors.length,1);assert.match(b.errors[0].message,/could not load/);
 assert.equal(b.timers.size,0);
});
test('successful playback clears the start timeout',()=>{
 const b=browser();b.api.speak('cat','cat.mp3');b.audios[0].dispatchEvent(new Event('playing'));
 assert.equal(b.timers.size,0);assert.equal(b.errors.length,0);
});
test('hidden pages do not start prompts or answer effects',()=>{
 const b=browser();b.document.visibilityState='hidden';
 b.api.speak('cat','cat.mp3');b.api.playAnswerSound(true);
 assert.equal(b.audios.length,0);
});
test('pagehide stops feedback effects as well as prompts',()=>{
 const b=browser();b.api.playAnswerSound(true);
 assert.ok(b.audios.some(a=>!a.paused));
 b.window.dispatchEvent(new Event('pagehide'));
 assert.ok(b.audios.every(a=>a.paused));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest} from './worker.mjs';
const origin='https://mahrush666.github.io';
const env={ALLOWED_ORIGINS:origin,GROQ_API_KEY:'test-only-secret',SPEECH_RATE_LIMITER:{limit:async()=>({success:true})}};
const request=(options={})=>new Request('https://speech.example/transcribe',{method:'POST',headers:{Origin:origin,'Content-Type':'audio/mp4'},body:new Uint8Array(400),...options});
const recognized={text:'Jump.',duration:2,segments:[{no_speech_prob:0.01,avg_logprob:-0.2}]};
const response=body=>new Response(JSON.stringify(body));
test('supported recordings reach Groq without an expected-answer hint and return recognized text',async()=>{
 for(const [type,ext] of [['audio/mp4','m4a'],['audio/webm;codecs=opus','webm']]){
 const result=await handleRequest(request({headers:{Origin:origin,'Content-Type':type}}),env,async(url,init)=>{
  assert.equal(url,'https://api.groq.com/openai/v1/audio/transcriptions');
  assert.equal(init.headers.Authorization,'Bearer test-only-secret');
  assert.equal(init.body.get('file').name,`recording.${ext}`);
  assert.equal(init.body.get('model'),'whisper-large-v3-turbo');
  assert.equal(init.body.get('language'),'en');assert.equal(init.body.get('prompt'),null);
  return response(recognized);
 });
 assert.equal(result.headers.get('Access-Control-Allow-Origin'),origin);
 assert.equal(result.headers.get('Cache-Control'),'no-store');
 assert.deepEqual(await result.json(),{status:'recognized',transcript:'Jump.'});
 }
});
test('silence and uncertain speech never produce a grade',async()=>{
 for(const data of [{...recognized,segments:[{no_speech_prob:0.9,avg_logprob:-0.1}]},{...recognized,segments:[{no_speech_prob:0.1,avg_logprob:-2}]},{...recognized,text:''},{...recognized,segments:[]}]){
  assert.deepEqual(await (await handleRequest(request(),env,async()=>response(data))).json(),{status:'unclear',transcript:''});
 }
});
test('untrusted or absent origins never reach Groq',async()=>{
 for(const headers of [{'Content-Type':'audio/mp4'},{Origin:'https://untrusted.example','Content-Type':'audio/mp4'}]){
  assert.equal((await handleRequest(request({headers}),env,()=>{throw new Error('should not call')})).status,403);
 }
});
test('preflight succeeds and unsupported/oversized/long recordings are rejected',async()=>{
 assert.equal((await handleRequest(new Request('https://speech.example/transcribe',{method:'OPTIONS',headers:{Origin:origin}}),env)).status,204);
 assert.equal((await handleRequest(request({headers:{Origin:origin,'Content-Type':'text/plain'}}),env)).status,415);
 assert.equal((await handleRequest(request({body:new Uint8Array(1024*1024+1)}),env)).status,413);
 assert.equal((await handleRequest(request(),env,async()=>response({...recognized,duration:60}))).status,422);
});
test('incomplete setup and exhausted free quotas are explicit',async()=>{
 assert.equal((await handleRequest(request(),{...env,GROQ_API_KEY:''})).status,503);
 assert.equal((await handleRequest(request(),{...env,SPEECH_RATE_LIMITER:null})).status,503);
 const limited=await handleRequest(request(),env,async()=>new Response('quota',{status:429}));
 assert.equal(limited.status,429);assert.deepEqual(await limited.json(),{error:'busy'});
 assert.equal((await handleRequest(request(),{...env,SPEECH_RATE_LIMITER:{limit:async()=>({success:false})}})).status,429);
});
test('provider failures and timeouts never leak credentials or mark answers wrong',async()=>{
 for(const upstream of [async()=>new Response('test-only-secret',{status:401}),async()=>{throw new Error('test-only-secret')},async()=>new Response('invalid json')]){
  const result=await handleRequest(request(),env,upstream);assert.equal(result.status,502);
  assert.deepEqual(await result.json(),{error:'service_unavailable'});
 }
});

test('a real silent WAV is rejected before contacting Groq',async()=>{
 const bytes=Buffer.alloc(32044);bytes.write('RIFF');bytes.writeUInt32LE(32036,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(16000,24);bytes.writeUInt32LE(32000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(32000,40);
 const result=await handleRequest(request({body:bytes,headers:{Origin:origin,'Content-Type':'audio/wav'}}),env,()=>{throw Error('silent audio should not reach the provider')});
 assert.deepEqual(await result.json(),{status:'unclear',transcript:''});
});

test('read-only health works directly and from the app without audio or provider calls',async()=>{
 for(const headers of [{},{Origin:origin}]){
  const result=await handleRequest(new Request('https://speech.example/health',{headers}),env,()=>{throw Error('no provider call')});
  assert.deepEqual(await result.json(),{status:'ready'});
  assert.equal(result.headers.get('Access-Control-Allow-Origin'),headers.Origin??null);
 }
 assert.equal((await handleRequest(new Request('https://speech.example/health'),{...env,GROQ_API_KEY:''})).status,503);
 assert.equal((await handleRequest(new Request('https://speech.example/health',{headers:{Origin:'https://untrusted.example'}}),env)).status,403);
});
test('multipart audio upload preserves format and enforces size and origin limits',async()=>{
 const form=()=>{const f=new FormData();f.set('file',new Blob([new Uint8Array(400)],{type:'audio/mp4'}),'recording');return f};
 const result=await handleRequest(new Request('https://speech.example/transcribe',{method:'POST',headers:{Origin:origin},body:form()}),env,async(url,init)=>{assert.equal(init.body.get('file').type,'audio/mp4');assert.equal(init.body.get('file').size,400);return response(recognized)});
 assert.deepEqual(await result.json(),{status:'recognized',transcript:'Jump.'});
 assert.equal((await handleRequest(new Request('https://speech.example/transcribe',{method:'POST',body:form()}),env)).status,403);
 for(const [file,status] of [[new Blob([new Uint8Array(1024*1024+1)],{type:'audio/mp4'}),413],[new Blob(['bad'],{type:'text/plain'}),415],['not a file',415]]){
  const f=new FormData();f.set('file',file);
  assert.equal((await handleRequest(new Request('https://speech.example/transcribe',{method:'POST',headers:{Origin:origin},body:f}),env)).status,status);
 }
});

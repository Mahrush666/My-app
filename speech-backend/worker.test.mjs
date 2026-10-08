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

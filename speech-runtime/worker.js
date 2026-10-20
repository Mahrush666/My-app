import {env,pipeline} from './transformers.web.js';
const base=new URL('./',self.location.href).href;
const nativeFetch=self.fetch.bind(self);
let transcriber,cache,cacheOK=true,working=false;
self.fetch=async(input,options)=>{
 const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 if(url.startsWith(base)&&cache){const found=await cache.match(url);if(found)return found;}
 if(!url.startsWith(base))throw Error('External model requests are disabled.');
 return nativeFetch(input,options);
};
env.allowRemoteModels=false;env.allowLocalModels=true;
env.localModelPath=base+'models/';
env.useBrowserCache=false;
env.backends.onnx.wasm.wasmPaths=base;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
async function prepare(){
 const r=await nativeFetch(base+'manifest.json');if(!r.ok)throw Error('Download list unavailable.');
 const manifest=await r.json();
 try{cache=await caches.open('wordquest-'+manifest.version)}catch{cacheOK=false;cache=null;}
 // Keep an in-memory fallback for browsers that deny persistent storage.
 const memory=new Map();const persistent=cache;
 cache={match:async url=>memory.get(url)?.clone()||(persistent?await persistent.match(url):undefined)};
 let done=0;
 for(const asset of manifest.assets){
 const url=base+asset.name;
 if(persistent&&await persistent.match(url)){done+=asset.bytes;self.postMessage({type:'download',loaded:done,total:manifest.totalBytes});continue;}
 const response=await nativeFetch(url);if(!response.ok)throw Error('Could not download '+asset.name);
 const reader=response.body?.getReader();let chunks=[],size=0;
 if(reader){while(true){const part=await reader.read();if(part.done)break;chunks.push(part.value);size+=part.value.length;self.postMessage({type:'download',loaded:done+size,total:manifest.totalBytes});}}
 else{const bytes=new Uint8Array(await response.arrayBuffer());chunks=[bytes];size=bytes.length;}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(digest!==asset.sha256)throw Error('Incomplete download. Please retry.');
 const stored=new Response(bytes,{headers:{'Content-Type':asset.name.endsWith('.wasm')?'application/wasm':asset.name.endsWith('.mjs')?'text/javascript':'application/octet-stream'}});
 try{if(!persistent)throw Error();await persistent.put(url,stored.clone());}catch{cacheOK=false;memory.set(url,stored);}
 done+=asset.bytes;
 }
 self.postMessage({type:'initializing'});
 transcriber=await pipeline('automatic-speech-recognition','whisper-tiny.en',{device:'wasm',dtype:'q8'});
 self.postMessage({type:'ready',cached:cacheOK});
}
self.onmessage=async({data})=>{
 if(working)return;working=true;
 try{
 if(data.type==='prepare')await prepare();
 else if(data.type==='transcribe'){
 if(!transcriber)throw Error('Please enable speaking first.');
 const start=performance.now();
 const result=await transcriber(data.audio,{max_new_tokens:64,do_sample:false});
 self.postMessage({type:'result',text:result.text,seconds:(performance.now()-start)/1000});
 }
 }catch(e){self.postMessage({type:'error',message:e.message||String(e)})}finally{working=false}
};

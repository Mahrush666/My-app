import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {createHash} from 'node:crypto';
import path from 'node:path';
const out='public/local-speech',revision='79fb389fc764e7c395bd330e9531d9d32ada7049';
await fs.mkdir(out,{recursive:true});
await build({entryPoints:['speech-runtime/node_modules/@huggingface/transformers/dist/transformers.web.js'],bundle:true,platform:'browser',format:'esm',minify:true,outfile:out+'/transformers.web.js'});
await fs.copyFile('speech-runtime/node_modules/@huggingface/transformers/LICENSE',out+'/TRANSFORMERS-LICENSE');
await fs.copyFile('speech-runtime/ONNX-LICENSE.txt',out+'/ONNX-LICENSE.txt');
const runtime='speech-runtime/node_modules/onnxruntime-web/dist';
const runtimeFiles=(await fs.readdir(runtime)).filter(n=>/^ort-wasm.*\.(wasm|mjs)$/.test(n));
for(const name of runtimeFiles)await fs.copyFile(runtime+'/'+name,out+'/'+name);
const files=['config.json','generation_config.json','preprocessor_config.json','tokenizer.json','tokenizer_config.json','onnx/encoder_model_quantized.onnx','onnx/decoder_model_merged_quantized.onnx'];
for(const name of [...files,'README.md']){
 const dest=out+'/models/whisper-tiny.en/'+name;await fs.mkdir(path.dirname(dest),{recursive:true});
 try{await fs.access(dest)}catch{
 const url='https://huggingface.co/Xenova/whisper-tiny.en/resolve/'+revision+'/'+name;
 const r=await fetch(url,{signal:AbortSignal.timeout(180000)});if(!r.ok)throw Error('Model download failed: '+name+' '+r.status);
 await fs.writeFile(dest,Buffer.from(await r.arrayBuffer()));
 }
}
const assets=[...files.map(n=>'models/whisper-tiny.en/'+n),...runtimeFiles];
const manifest=[];
for(const name of assets){const bytes=await fs.readFile(out+'/'+name);manifest.push({name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')})}
await fs.copyFile('speech-runtime/worker.js',out+'/worker.js');
await fs.writeFile(out+'/manifest.json',JSON.stringify({version:'whisper-tiny-en-q8-3.8.1-v1',assets:manifest,totalBytes:manifest.reduce((n,f)=>n+f.bytes,0)}));
console.log('Local speech assets ready:',Math.round(manifest.reduce((n,f)=>n+f.bytes,0)/1048576)+' MiB');

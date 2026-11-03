import fs from 'node:fs';import assert from 'node:assert/strict';import{build}from'esbuild';import{createRequire}from'node:module';import QRCode from'qrcode';
const dir='.wrangler/qr-download/';fs.mkdirSync(dir,{recursive:true});
const first=await QRCode.toDataURL('https://example.com/homework?student=demo'),second=await QRCode.toDataURL('https://example.com/homework?student=another');
fs.writeFileSync(dir+'entry.tsx',`import React from'react';import{createRoot}from'react-dom/client';import QRDownload from'../../github-pages/qr-download';const root=createRoot(document.getElementById('root')!);(window as any).mount=(image:string)=>root.render(<QRDownload image={image} className="student-qr-save">Save QR</QRDownload>);(window as any).unmount=()=>root.unmount();(window as any).mount(${JSON.stringify(first)});`);
await build({entryPoints:[dir+'entry.tsx'],bundle:true,format:'iife',outfile:dir+'ui.js',define:{'process.env.NODE_ENV':'"production"'}});
const{Window}=createRequire(new URL('../.wrangler/qr-qa/package.json',import.meta.url))('happy-dom');const w=new Window({url:'https://example.com/#view=teacher',settings:{enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});let sequence=0;const blobs=[],revoked=[];
w.URL.createObjectURL=blob=>{blobs.push(blob);return 'blob:https://example.com/qr-'+(++sequence)};w.URL.revokeObjectURL=url=>revoked.push(url);
try{
 w.document.body.innerHTML='<div id="root"></div>';w.eval(fs.readFileSync(dir+'ui.js','utf8'));const wait=()=>new Promise(r=>setTimeout(r,50));await wait();await wait();
 let link=w.document.querySelector('a');assert.equal(link.href,'blob:https://example.com/qr-1');assert.equal(link.download,'student-homework-qr.png');assert.equal(link.target,'_blank');assert.match(link.rel,/noopener/);assert.match(link.rel,/noreferrer/);assert.equal(blobs[0].type,'image/png');
 const bytes=new Uint8Array(await blobs[0].arrayBuffer());assert.deepEqual([...bytes.slice(0,8)],[137,80,78,71,13,10,26,10]);
 w.mount(second);await wait();await wait();link=w.document.querySelector('a');assert.equal(link.href,'blob:https://example.com/qr-2');assert.equal(revoked.length,0,'Old file remains readable while browser finishes saving');
 w.unmount();assert.equal(revoked.length,0);assert.equal(w.location.hash,'#view=teacher');
 console.log('PASS: downloadable PNG bytes, blob URL, safe new-tab fallback, image replacement, deferred cleanup, unchanged app route');
}finally{await w.happyDOM.close()}
fs.writeFileSync(dir+'preview.html','<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>QR download check</title><h1>Students · QR download check</h1><p>Sample QR only. Saving should leave this page open.</p><div id="root"></div><script src="ui.js"></script>');

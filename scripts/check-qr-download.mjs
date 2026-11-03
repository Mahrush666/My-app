import fs from 'node:fs';import assert from 'node:assert/strict';import{build}from'esbuild';import{createRequire}from'node:module';import QRCode from'qrcode';
const dir='.wrangler/qr-download/';fs.mkdirSync(dir,{recursive:true});
const first=await QRCode.toDataURL('https://example.com/homework?student=demo'),second=await QRCode.toDataURL('https://example.com/homework?student=another');
fs.writeFileSync(dir+'entry.tsx',`import React from'react';import{createRoot}from'react-dom/client';import QRDownload from'../../github-pages/qr-download';const root=createRoot(document.getElementById('root')!);(window as any).mount=(image:string)=>root.render(<QRDownload image={image} className="student-qr-save">Save QR</QRDownload>);(window as any).unmount=()=>root.unmount();(window as any).mount(${JSON.stringify(first)});`);
await build({entryPoints:[dir+'entry.tsx'],bundle:true,format:'iife',outfile:dir+'ui.js',define:{'process.env.NODE_ENV':'"production"'}});
const{Window}=createRequire(new URL('../.wrangler/qr-qa/package.json',import.meta.url))('happy-dom');const w=new Window({url:'https://example.com/#view=teacher',settings:{enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
try{
 w.URL.createObjectURL=()=>{throw Error('QR downloads must not create temporary blob links')};
 w.document.body.innerHTML='<div id="root"></div>';w.eval(fs.readFileSync(dir+'ui.js','utf8'));const wait=()=>new Promise(r=>setTimeout(r,50));await wait();
 let link=w.document.querySelector('a'),frame=w.document.querySelector('iframe');assert.equal(link.href,first);assert.equal(link.download,'student-homework-qr.png');assert.notEqual(link.target,'_blank');assert.notEqual(link.target,'_self');assert.equal(link.target,frame.name);assert.equal(frame.hidden,true);assert.equal(frame.getAttribute('aria-hidden'),'true');
 const target=frame.name;const bytes=Buffer.from(link.href.split(',')[1],'base64');assert.deepEqual([...bytes.slice(0,8)],[137,80,78,71,13,10,26,10]);
 w.mount(second);await wait();link=w.document.querySelector('a');assert.equal(link.href,second);assert.equal(link.target,target);assert.equal(w.document.querySelectorAll('iframe').length,1);
 w.mount('');await wait();assert.equal(w.document.querySelector('button').disabled,true);assert.equal(w.document.querySelector('a'),null);
 w.unmount();assert.equal(w.document.querySelector('iframe'),null);assert.equal(w.location.hash,'#view=teacher');
 console.log('PASS: self-contained PNG, no blob URLs or external-tab links, named hidden fallback, updated QR bytes, invalid-image guard, unchanged teacher route');
}finally{await w.happyDOM.close()}
fs.writeFileSync(dir+'preview.html','<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QR download check</title><h1>Students · QR download check</h1><p>Sample QR only. Saving should leave this page open.</p><div id="root"></div><script src="ui.js"></script>');

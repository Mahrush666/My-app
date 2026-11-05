import fs from 'node:fs';import assert from 'node:assert/strict';import{build}from'esbuild';import{createRequire}from'node:module';
const dir='.wrangler/teacher-class-practice/';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(dir+'entry.tsx',`import React from'react';import{createRoot}from'react-dom/client';import Panel from'../../github-pages/teacher-class-practice';const w=window as any;w.pending=[];w.render=(id:string)=>root.render(<Panel groupId={id} name={'Class '+id} request={async(path:string)=>new Promise((resolve,reject)=>w.pending.push({path,resolve,reject}))}/>);const root=createRoot(document.getElementById('root')!);w.render('A');`);
await build({entryPoints:[dir+'entry.tsx'],bundle:true,format:'iife',platform:'browser',outfile:dir+'ui.js',define:{'process.env.NODE_ENV':'"production"'}});
const{Window}=createRequire(new URL('../.wrangler/qr-qa/package.json',import.meta.url))('happy-dom');
const w=new Window({url:'https://example.com',width:390,height:844,settings:{enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}}),wait=()=>new Promise(r=>setTimeout(r,60));
const data=(id,name)=>({groupId:id,weekStart:'2026-11-02',today:'2026-11-04',students:[{id:'1',name,reviewDays:['2026-11-02','2026-11-04'],xp:150,weeklyXP:20},{id:'2',name:'Not started',reviewDays:[],xp:0,weeklyXP:0}]});
try{
 w.document.body.innerHTML='<div id="root"></div>';w.eval(fs.readFileSync(dir+'ui.js','utf8'));await wait();assert.match(w.pending[0].path,/group=A$/);
 w.render('B');await wait();w.pending[1].resolve(data('B','Ben'));await wait();w.pending[0].resolve(data('A','Private Amy'));await wait();
 assert(!w.document.body.textContent.includes('Private Amy'),'Late response from previous class is ignored');assert.match(w.document.body.textContent,/Ben/);
 const rows=w.document.querySelectorAll('.tcp-student');assert.equal(rows.length,2);assert.equal(rows[0].querySelectorAll('.week-review-track li').length,7);assert.equal(rows[0].querySelectorAll('.is-done').length,2);assert.equal(rows[1].querySelectorAll('.is-done').length,0);assert.match(rows[0].textContent,/2\/7/);assert.match(rows[0].textContent,/20.*150/);
 w.document.querySelector('.tcp-heading button').click();await wait();w.pending[2].reject(new w.Error('Network unavailable'));await wait();assert.match(w.document.querySelector('[role=alert]').textContent,/Network unavailable/);assert.equal(w.document.querySelectorAll('.tcp-student').length,2,'Refresh error preserves last known roster');
 w.document.querySelector('[role=alert] button').click();await wait();w.pending[3].resolve({...data('B','Ben'),students:[]});await wait();assert.equal(w.document.querySelectorAll('.tcp-student').length,0);assert.match(w.document.body.textContent,/No approved students/);
 console.log('PASS: class switching ignores stale replies; 7-day ticks and XP; zero-practice students; refresh, error/retry, and empty roster');
}finally{await w.happyDOM.close()}

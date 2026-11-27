import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDatabase} from '../supabase/classroom/test-adapter.mjs';
import {handle} from '../dist-classroom/worker.mjs';
test('Five good friends: eight picture/listening questions, two story orders and daily credit',async()=>{
 const DB=await localDatabase(),origin='https://mahrush666.github.io';
 async function api(path,data,token,expected=200){const r=await handle(new Request('https://classroom.test'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),{DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'sample-password'});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d}
 try{
  const teacher=(await api('/teacher-login',{password:'sample-password'})).token;
  const group=(await api('/groups',{name:'Five friends sample'},teacher)).id;
  const child=(await api('/teacher-students',{groupId:group,names:['Sample learner']},teacher)).students[0].id;
  const access=(await api('/student-link',{childId:child},teacher)).access;
  const student=(await api('/student-login',{access})).token;
  const assignment=(await api('/assignments',{groupId:group,unitId:'pu-starter-u9-lesson4',activities:['reading','story-quiz','story-order'],dailyPractice:true},teacher)).id;
  let hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].total,10);
  await api('/progress',{childId:child,assignmentId:assignment,activity:'story-quiz',wordId:'pu-starter-u9-l4-missing',answer:'0',correct:true,eventId:crypto.randomUUID()},student);
  assert.equal((await api('/homework?child='+child,undefined,student)).homeworkProgress[assignment].done,0);
  const run=await api('/daily-practice',{childId:child},student);assert.equal(new Set(run.tasks.map(t=>t.wordId)).size,8);assert(run.tasks.every(t=>['pictures','audio-options'].includes(t.kind)));
  const feelings=[...new Map(run.tasks.filter(t=>t.wordId.startsWith('pu-starter-u9-l4-feeling-')).map(t=>[t.wordId,t])).values()];assert.equal(feelings.length,3);assert.equal(feelings.find(t=>t.wordId.endsWith('-2')).expected,'Happy.');
  const thanks=run.tasks.find(t=>t.wordId==='pu-starter-u9-l4-thanks');assert(thanks.options.every(o=>o.recording?.startsWith('lesson-audio/pu-starter-u9-lesson4-original/line-')));
  const oldTasks=run.tasks.map(({recording,...task})=>({...task,options:task.options?.map(({recording,...option})=>option)}));
  await DB.prepare('UPDATE daily_runs SET tasks=? WHERE id=?').bind(JSON.stringify(oldTasks),run.id).run();
  const refreshed=await api('/daily-practice',{childId:child},student);assert.equal(refreshed.id,run.id);assert(refreshed.tasks.find(t=>t.wordId==='pu-starter-u9-l4-thanks').options.every(o=>o.recording?.startsWith('lesson-audio/pu-starter-u9-lesson4-original/line-')));
  for(const t of run.tasks)await api('/daily-practice-answer',{childId:child,runId:run.id,taskId:t.id,answer:t.expected,eventId:crypto.randomUUID()},student);
  assert.equal((await api('/homework?child='+child,undefined,student)).homeworkProgress[assignment].done,8);
  for(const [wordId,numbers] of [['pu-starter-u9-l4-find-order',[2,3,6]],['pu-starter-u9-l4-help-order',[7,8,9]]])await api('/progress',{childId:child,assignmentId:assignment,activity:'story-order',wordId,answer:numbers.map(n=>'pu-starter-u9-l4-panel-'+n).join(','),correct:true,eventId:crypto.randomUUID()},student);
  hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].percent,100);
 }finally{await DB.sqlite.close()}
});

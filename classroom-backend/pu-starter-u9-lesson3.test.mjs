import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDatabase} from '../supabase/classroom/test-adapter.mjs';
import {handle} from '../dist-classroom/worker.mjs';
test('Starter farm lesson: five vocabulary cards, numbered animal quiz and daily homework credit',async()=>{
 const DB=await localDatabase(),origin='https://mahrush666.github.io';
 async function api(path,data,token,expected=200){const r=await handle(new Request('https://classroom.test'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),{DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'sample-password'});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d}
 try{
  const teacher=(await api('/teacher-login',{password:'sample-password'})).token;
  const group=(await api('/groups',{name:'Farm animals sample'},teacher)).id;
  const child=(await api('/teacher-students',{groupId:group,names:['Sample learner']},teacher)).students[0].id;
  const access=(await api('/student-link',{childId:child},teacher)).access;
  const student=(await api('/student-login',{access})).token;
  const assignment=(await api('/assignments',{groupId:group,unitId:'pu-starter-u9-lesson3',activities:['sound-picture','picture-listen','story-quiz'],dailyPractice:true},teacher)).id;
  let hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].total,15);
  await api('/progress',{childId:child,assignmentId:assignment,activity:'story-quiz',wordId:'pu-starter-u9-l3-number-1',answer:'1',correct:true,eventId:crypto.randomUUID()},student);
  assert.equal((await api('/homework?child='+child,undefined,student)).homeworkProgress[assignment].done,0);
  const run=await api('/daily-practice',{childId:child},student);assert.equal(run.tasks.length,12);assert(run.tasks.every(t=>['pictures','audio-options'].includes(t.kind)));
  const animals=['horse','goat','dog','duck','sheep'];
  for(const t of run.tasks){assert(animals.includes(t.expected));assert(t.options.every(o=>animals.includes(o.text)));await api('/daily-practice-answer',{childId:child,runId:run.id,taskId:t.id,answer:t.expected,eventId:crypto.randomUUID()},student)}
  assert.equal((await api('/homework?child='+child,undefined,student)).homeworkProgress[assignment].done,12);
  for(const animal of animals)for(const activity of ['sound-picture','picture-listen'])await api('/progress',{childId:child,assignmentId:assignment,activity,wordId:'pu-starter-u9-l3-'+animal,correct:true,eventId:crypto.randomUUID()},student);
  for(const [i,answer] of ['0','3','2','1','0'].entries())await api('/progress',{childId:child,assignmentId:assignment,activity:'story-quiz',wordId:'pu-starter-u9-l3-number-'+(i+1),answer,correct:true,eventId:crypto.randomUUID()},student);
  hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].percent,100);
 }finally{await DB.sqlite.close()}
});

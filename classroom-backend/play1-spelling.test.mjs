import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDatabase} from '../supabase/classroom/test-adapter.mjs';
import {handle} from '../dist-classroom/worker.mjs';
test('Play 1 word building keeps syllables and spaces in daily practice and completes the five homework stages',async()=>{
 const DB=await localDatabase(),origin='https://mahrush666.github.io';
 async function api(path,data,token){const r=await handle(new Request('https://classroom.test'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),{DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'sample-password'});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d}
 try{
  const teacher=(await api('/teacher-login',{password:'sample-password'})).token;
  for(const n of [1,2]){
   const group=(await api('/groups',{name:'Play 1 spelling '+n},teacher)).id;
   const child=(await api('/teacher-students',{groupId:group,names:['Spelling pupil']},teacher)).students[0].id;
   const access=(await api('/student-link',{childId:child},teacher)).access;
   const student=(await api('/student-login',{access})).token;
   const assignment=(await api('/assignments',{groupId:group,unitId:'play1-u5-lesson'+n,activities:['spell'],dailyPractice:true},teacher)).id;
   const initial=await api('/homework?child='+child,undefined,student),ids=JSON.parse(initial.assignments[0].word_ids);
   assert.equal(initial.homeworkProgress[assignment].total,30);
   const run=await api('/daily-practice',{childId:child},student);
   const word=n===1?'dinosaur':'teddy bear',syllables=n===1?['di','no','saur']:['ted','dy',' bear'];
   const task=run.tasks.find(t=>t.expected===word);assert(task);assert.deepEqual(task.spelling.parts,syllables);assert.deepEqual(task.spelling.gaps,[0,1,2]);assert.equal(task.spelling.parts.join(''),word);
   const ordinary=run.tasks.find(t=>!t.spelling.parts);assert(ordinary);assert(ordinary.spelling.gaps.length>=4);
   const answered=await api('/daily-practice-answer',{childId:child,runId:run.id,taskId:task.id,answer:task.expected,eventId:crypto.randomUUID()},student);assert.equal(answered.correct,true);
   for(let stage=1;stage<=4;stage++)for(const wordId of ids)await api('/progress',{childId:child,assignmentId:assignment,activity:'spell',stage:'step'+stage,wordId,correct:true,eventId:crypto.randomUUID()},student);
   let hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].percent,80);assert(!hw.completed.some(c=>c.assignment_id===assignment&&c.activity==='spell'));
   for(const wordId of ids)await api('/progress',{childId:child,assignmentId:assignment,activity:'spell',stage:'step5',wordId,correct:true,eventId:crypto.randomUUID()},student);
   hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].percent,100);assert(hw.completed.some(c=>c.assignment_id===assignment&&c.activity==='spell'));
  }
 }finally{await DB.sqlite.close()}
});

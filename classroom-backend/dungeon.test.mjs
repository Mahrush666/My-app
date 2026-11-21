import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDatabase} from '../supabase/classroom/test-adapter.mjs';
import {handle} from '../dist-classroom/worker.mjs';
test('Word Dungeon uses assigned lesson words, checks actual answers, and credits homework and daily practice once',async()=>{
 const DB=await localDatabase(),origin='https://mahrush666.github.io';
 async function api(path,data,token,expected=200){const r=await handle(new Request('https://classroom.test'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),{DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'sample-password'});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d}
 try{
  const teacher=(await api('/teacher-login',{password:'sample-password'})).token;
  const group=(await api('/groups',{name:'Dungeon sample class'},teacher)).id;
  const child=(await api('/teacher-students',{groupId:group,names:['Dungeon pupil']},teacher)).students[0].id;
  const access=(await api('/student-link',{childId:child},teacher)).access;
  const student=(await api('/student-login',{access})).token;
  const assignment=(await api('/assignments',{groupId:group,unitId:'play1-u5-lesson1',activities:['dungeon'],dailyPractice:true},teacher)).id;
  let hw=await api('/homework?child='+child,undefined,student);const ids=JSON.parse(hw.assignments[0].word_ids);assert.equal(ids.length,6);assert.equal(hw.homeworkProgress[assignment].total,6);
  const wrong=await api('/progress',{childId:child,assignmentId:assignment,activity:'dungeon',wordId:ids[0],answer:'incorrect word',correct:true,eventId:crypto.randomUUID()},student);assert.equal((await api('/homework?child='+child,undefined,student)).homeworkProgress[assignment].done,0);
  const first={childId:child,assignmentId:assignment,activity:'dungeon',wordId:ids[0],answer:'dinosaur',correct:true,eventId:crypto.randomUUID()};await api('/progress',first,student);assert.equal((await api('/progress',first,student)).duplicate,true);
  const run=await api('/daily-practice',{childId:child},student);assert(run.tasks.length>0);assert(run.tasks.every(t=>t.activity==='dungeon'&&t.kind==='pictures'&&ids.includes(t.wordId)));
  for(const task of run.tasks)await api('/daily-practice-answer',{childId:child,runId:run.id,taskId:task.id,answer:task.expected,eventId:crypto.randomUUID()},student);
  hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].percent,100);assert.equal(hw.completed.filter(c=>c.assignment_id===assignment&&c.activity==='dungeon').length,1);
  const rewards=JSON.stringify(hw.rewards);await api('/progress',{...first,eventId:crypto.randomUUID()},student);assert.equal(JSON.stringify((await api('/homework?child='+child,undefined,student)).rewards),rewards);
  const sports=(await api('/assignments',{groupId:group,unitId:'sports-actions-dungeon',activities:['dungeon']},teacher)).id;
  hw=await api('/homework?child='+child,undefined,student);assert.equal(JSON.parse(hw.assignments.find(a=>a.id===sports).word_ids).length,16);
  await api('/progress',{...first,assignmentId:sports,eventId:crypto.randomUUID()},student,400);
 }finally{await DB.sqlite.close()}
});

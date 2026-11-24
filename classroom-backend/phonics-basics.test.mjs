import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDatabase} from '../supabase/classroom/test-adapter.mjs';
import {handle} from '../dist-classroom/worker.mjs';

test('Phonics basics: 12 blends, recorded daily tasks, whole-pair spelling and homework credit',async()=>{
 const DB=await localDatabase(),origin='https://mahrush666.github.io';
 async function api(path,data,token,expected=200){const r=await handle(new Request('https://classroom.test'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),{DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'sample-password'});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d}
 try{
  const teacher=(await api('/teacher-login',{password:'sample-password'})).token;
  const group=(await api('/groups',{name:'Blend practice'},teacher)).id;
  const child=(await api('/teacher-students',{groupId:group,names:['Sample reader']},teacher)).students[0].id;
  const access=(await api('/student-link',{childId:child},teacher)).access;
  const student=(await api('/student-login',{access})).token;
  const assignment=(await api('/assignments',{groupId:group,unitId:'phonics-basics-pairs',activities:['sound-word','word-sound','spell'],dailyPractice:true},teacher)).id;
  let hw=await api('/homework?child='+child,undefined,student);
  assert.equal(hw.homeworkProgress[assignment].total,36);
  const run=await api('/daily-practice',{childId:child},student);
  assert.equal(run.tasks.length,12);
  assert.equal(new Set(run.tasks.map(t=>t.wordId)).size,12);
  for(const t of run.tasks){
   assert.match(t.wordId,/^phonics-basics-(am|an|ap|at|as|ed|en|es|ib|id|ig|is)$/);
   if(t.listen)assert.equal(t.recording,'lesson-audio/phonics-basics/'+t.expected+'.mp3');
   if(t.options){assert.equal(t.options.length,4);for(const o of t.options)assert.equal(o.recording,'lesson-audio/phonics-basics/'+o.text+'.mp3')}
   if(t.spelling){assert.equal(t.spelling.stage,4);assert.deepEqual(t.spelling.gaps,[0,1])}
   await api('/daily-practice-answer',{childId:child,runId:run.id,taskId:t.id,answer:t.expected,eventId:crypto.randomUUID()},student);
  }
  hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].done,12);
  // A fabricated success flag must not credit a wrong constructed pair.
  const spell={childId:child,assignmentId:assignment,activity:'spell',wordId:'phonics-basics-am',stage:'step5'};
  await api('/progress',{...spell,answer:'ma',correct:true,eventId:crypto.randomUUID()},student);
  assert.equal((await api('/homework?child='+child,undefined,student)).homeworkProgress[assignment].done,12);
  for(const pair of ['am','an','ap','at','as','ed','en','es','ib','id','ig','is'])for(const activity of ['sound-word','word-sound','spell'])await api('/progress',{...spell,activity,wordId:'phonics-basics-'+pair,answer:pair,correct:true,eventId:crypto.randomUUID()},student);
  hw=await api('/homework?child='+child,undefined,student);
  assert.equal(hw.homeworkProgress[assignment].percent,100);
  assert.equal(hw.homeworkProgress[assignment].done,36);
 }finally{await DB.sqlite.close()}
});

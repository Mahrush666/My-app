import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDatabase} from '../supabase/classroom/test-adapter.mjs';
import {handle} from '../dist-classroom/worker.mjs';
test('CVC lesson assigns all vowels, validates complete words, and credits one build per word in homework and daily practice',async()=>{
 const DB=await localDatabase();const origin='https://mahrush666.github.io';
 async function api(path,data,token){const r=await handle(new Request('https://classroom.test'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),{DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'sample-password'});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
 try{
  const teacher=(await api('/teacher-login',{password:'sample-password'})).token;
  const group=(await api('/groups',{name:'CVC sample class'},teacher)).id;
  const child=(await api('/teacher-students',{groupId:group,names:['Sample reader']},teacher)).students[0].id;
  const access=(await api('/student-link',{childId:child},teacher)).access;
  const student=(await api('/student-login',{access})).token;
  const assignment=(await api('/assignments',{groupId:group,unitId:'act3-u7-lesson5',activities:['sound-word','spell'],dailyPractice:true},teacher)).id;
  let homework=await api('/homework?child='+child,undefined,student);
  const words=JSON.parse(homework.assignments[0].word_ids);assert.equal(words.length,25);
  const state=homework.homeworkProgress[assignment];assert.equal(state.total,50);assert.equal(state.exercises.find(e=>e.activity==='spell').total,25);
  const post=(wordId,activity,answer)=>api('/progress',{childId:child,assignmentId:assignment,wordId,activity,answer,correct:true,stage:'step5',eventId:crypto.randomUUID()},student);
  await post(words[0],'spell','wrong');
  homework=await api('/homework?child='+child,undefined,student);assert.equal(homework.homeworkProgress[assignment].done,0);
  const daily=await api('/daily-practice',{childId:child},student);
  const builders=daily.tasks.filter(t=>t.activity==='spell');assert(builders.length>0);assert(builders.every(t=>t.spelling.stage===4&&t.spelling.gaps.length===3&&t.creditActivity==='spell'));
  for(const wordId of words){const word=wordId.replace('act3-u7-l5-','');assert.match(word,/^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/);await post(wordId,'spell',word);await post(wordId,'sound-word',word);}
  homework=await api('/homework?child='+child,undefined,student);assert.equal(homework.homeworkProgress[assignment].percent,100);assert.equal(homework.completed.length,2);
  const report=await api('/homework-report?child='+child+'&assignment='+assignment,undefined,teacher);assert.equal(report.finished,true);
 }finally{await DB.sqlite.close()}
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDatabase} from '../supabase/classroom/test-adapter.mjs';
import {handle} from '../dist-classroom/worker.mjs';
test('Play 1 Unit 5 assigns distinct toy vocabulary and checks audio-first possession and ownership homework',async()=>{
 const DB=await localDatabase(),origin='https://mahrush666.github.io';
 async function api(path,data,token){const r=await handle(new Request('https://classroom.test'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),{DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'sample-password'});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d}
 try{
  const teacher=(await api('/teacher-login',{password:'sample-password'})).token;
  const group=(await api('/groups',{name:'Play 1 sample class'},teacher)).id;
  const child=(await api('/teacher-students',{groupId:group,names:['Sample pupil']},teacher)).students[0].id;
  const access=(await api('/student-link',{childId:child},teacher)).access;
  const student=(await api('/student-login',{access})).token;
  const sets=[['dinosaur','robot','board-game','balloon','boat','train'],['ball','doll','blocks','teddy-bear','truck','plane']];
  assert.equal(new Set(sets.flat()).size,12);
  for(const n of [1,2]){
   const activities=n===1?['look-listen','sound-picture','picture-listen']:['look-listen','sound-picture','reading','story-quiz'];
   const assignment=(await api('/assignments',{groupId:group,unitId:'play1-u5-lesson'+n,activities},teacher)).id;
   let hw=await api('/homework?child='+child,undefined,student);const task=hw.assignments.find(a=>a.id===assignment);
   const ids=JSON.parse(task.word_ids);assert.deepEqual(ids,sets[n-1].map(w=>'play1-u5-l'+n+'-'+w));assert.equal(hw.homeworkProgress[assignment].total,12);
   const post=(activity,wordId,answer)=>api('/progress',{childId:child,assignmentId:assignment,activity,wordId,answer,correct:true,eventId:crypto.randomUUID()},student);
   for(const id of ids)await post('sound-picture',id);
   if(n===1)for(const id of ids)await post('picture-listen',id);
   else{
    const answers=[1,2,1,2,0,0];
    const incorrect=await post('story-quiz','play1-u5-l2-who-ball','0');assert.equal(incorrect.correct,false);
    for(let i=0;i<6;i++){const result=await post('story-quiz','play1-u5-l2-who-'+sets[1][i],String(answers[i]));assert.equal(result.correct,true)}
   }
   hw=await api('/homework?child='+child,undefined,student);assert.equal(hw.homeworkProgress[assignment].percent,100);
   assert.equal((await api('/homework-report?child='+child+'&assignment='+assignment,undefined,teacher)).finished,true);
  }
 }finally{await DB.sqlite.close()}
});

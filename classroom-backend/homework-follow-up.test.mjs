import {test} from 'node:test';
import assert from 'node:assert/strict';
const {localDatabase}=await import(process.env.WORDQUEST_TEST_DATABASE==='postgres'?'../supabase/classroom/test-adapter.mjs':'./sqlite-adapter.mjs');
import {handle} from '../dist-classroom/worker.mjs';
const origin='https://mahrush666.github.io';
async function setup(extra={}){const DB=await localDatabase();const env={DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'test-teacher-password',...extra};let seq=0;
 return {DB,async api(path,body,token){const r=await handle(new Request('https://classroom.test'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json','CF-Connecting-IP':'test-'+seq++},body:body===undefined?undefined:JSON.stringify(body)}),env);return {status:r.status,body:await r.json()}}};}
test('dashboard homework totals exclude archives and test profiles, retain transfers, and respect campus scope',async()=>{
 const {api,DB}=await setup();
 try{
  const teacher=(await api('/teacher-login',{password:'test-teacher-password'})).body.token;
  const campus=(await api('/campuses',{name:'Follow-up campus'},teacher)).body.id;
  const a=(await api('/groups',{name:'Follow-up A'},teacher)).body;
  const b=(await api('/groups',{name:'Follow-up B',campusId:campus},teacher)).body;
  const children=(await api('/teacher-students',{groupId:a.id,names:['Sam','Taylor','Test profile','Pending']},teacher)).body.students;
  const [sam,taylor,testing,pending]=children;
  await api('/approve',{childId:pending.id,approved:false},teacher);
  const noHomework=(await api('/teacher-students',{groupId:b.id,names:['No homework']},teacher)).body.students[0];
  const assignments=[];
  for(let i=0;i<4;i++)assignments.push((await api('/assignments',{groupId:a.id,unitId:'pu-starter-u7-lesson1',activities:['picture-listen','sound-picture'],title:'Homework '+i},teacher)).body.id);
  assert.equal(new Set(assignments).size,4);
  for(const id of assignments)for(const activity of ['picture-listen','sound-picture'])await DB.prepare('INSERT INTO completions VALUES(?,?,?,?)').bind(taylor.id,id,activity,Date.now()).run();
  // A partly completed assignment still needs a reminder.
  await DB.prepare('INSERT INTO completions VALUES(?,?,?,?)').bind(sam.id,assignments[0],'picture-listen',Date.now()).run();
  const status=async(campus='all')=>(await api('/teacher?campus='+campus,undefined,teacher)).body.homeworkStatus;
  let rows=await status();
  assert.deepEqual(rows.find(r=>r.childId===sam.id),{childId:sam.id,total:4,finished:0,unfinished:4});
  assert.deepEqual(rows.find(r=>r.childId===taylor.id),{childId:taylor.id,total:4,finished:4,unfinished:0});
  assert.equal(rows.some(r=>[testing.id,pending.id,noHomework.id].includes(r.childId)),false);
  await api('/archive-assignment',{id:assignments[1],archived:true},teacher);
  rows=await status();assert.equal(rows.find(r=>r.childId===sam.id).unfinished,3);assert.equal(rows.find(r=>r.childId===taylor.id).total,3);
  await api('/archive-assignment',{id:assignments[1],archived:false},teacher);
  await api('/move-student',{childId:sam.id,name:'Sam',groupId:b.id},teacher);
  rows=await status(campus);assert.deepEqual(rows,[{childId:sam.id,total:4,finished:0,unfinished:4}]);
  assert.equal((await status('main')).some(r=>r.childId===sam.id),false);
  await api('/archive-assignment',{id:assignments[0],archived:true},teacher);
  assert.equal((await status(campus))[0].unfinished,3);
 }finally{await DB.sqlite.close()}
});

import {test} from 'node:test';import assert from 'node:assert/strict';
const {localDatabase}=await import(process.env.WORDQUEST_TEST_DATABASE==='postgres'?'../supabase/classroom/test-adapter.mjs':'./sqlite-adapter.mjs');
import {handle} from '../dist-classroom/worker.mjs';
const origin='https://mahrush666.github.io';
test('attendance topics are class-scoped; topic date survives profile edits and changes with the current lesson',async()=>{
 const DB=await localDatabase(),env={DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'test-topic-password'};let n=0;
 async function api(path,body,token){const r=await handle(new Request('https://test'+path,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'topic-'+n++,...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined}),env);return {status:r.status,body:await r.json()}}
 try{
 const teacher=(await api('/teacher-login',{password:'test-topic-password'})).body.token;
 const a=(await api('/groups',{name:'Topic A'},teacher)).body.id,b=(await api('/groups',{name:'Topic B'},teacher)).body.id;
 const base={kind:'progress',id:a,groupId:a,book:'ACT2',unit:9,lessonId:'act2-u9-lesson3',profileId:'',age:'5–7',level:'',difficulty:'',notes:'private teacher note',revision:0,updatedAt:0};
 const first=(await api('/lesson-planner',{record:base},teacher)).body.record;assert.equal(first.topicUpdatedAt,first.updatedAt);
 await new Promise(r=>setTimeout(r,5));
 const edited=(await api('/lesson-planner',{record:{...first,notes:'new private note',age:'6–7',topicUpdatedAt:Date.now()+999999}},teacher)).body.record;
 assert.equal(edited.topicUpdatedAt,first.topicUpdatedAt,'Profile edits and client-supplied dates do not refresh the topic date');assert(edited.updatedAt>first.updatedAt);
 const current=(await api('/current-lessons',undefined,teacher)).body.lessons.find(l=>l.groupId===a);assert.equal(current.changedAt,first.topicUpdatedAt);assert.equal(current.lessonId,first.lessonId);assert(current.title);assert(!('notes' in current));assert(!('age' in current));
 const extra={kind:'lesson',id:'extra-topic',groupId:a,book:'ACT2',unit:9,title:'CVC recap',focus:'private objective',afterId:'',revision:0,updatedAt:0};await api('/lesson-planner',{record:extra},teacher);
 await new Promise(r=>setTimeout(r,5));
 const changed=(await api('/lesson-planner',{record:{...edited,lessonId:extra.id}},teacher)).body.record;assert(changed.topicUpdatedAt>first.topicUpdatedAt);assert.equal(changed.topicUpdatedAt,changed.updatedAt);
 assert.equal((await api('/current-lessons',undefined,teacher)).body.lessons.find(l=>l.groupId===a).title,'CVC recap');
 await api('/lesson-planner',{record:{...base,id:b,groupId:b,notes:'Other class secret'}},teacher);
 // Older progress records receive their existing save date until the next topic change.
 const legacy={...base,id:'legacy-topic',groupId:b,revision:1,updatedAt:123456789};await DB.prepare('INSERT INTO config(key,value) VALUES(?,?)').bind('lesson_planner:progress:legacy-topic',JSON.stringify(legacy)).run();
 assert((await api('/current-lessons',undefined,teacher)).body.lessons.some(l=>l.changedAt===123456789));
 const id='attendance-topic-staff';await DB.prepare('INSERT INTO staff_accounts(id,name,username,role,permissions,groups_json,active,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(id,'Attendance teacher','topic_staff','assistant','["attendance"]',JSON.stringify([a]),1,0).run();
 const token='b'.repeat(64),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');await DB.prepare('INSERT INTO sessions VALUES(?,?,?,?)').bind(hash,id,'teacher',Date.now()+60000).run();
 const staff=await api('/current-lessons',undefined,token);assert.equal(staff.status,200);assert.equal(staff.body.lessons.length,1);assert.equal(staff.body.lessons[0].groupId,a);assert.equal((await api('/lesson-planner',undefined,token)).status,403,'Attendance-only staff cannot access plans');
 assert.equal((await api('/current-lessons',{},teacher)).status,405);
 const parent=(await api('/register',{username:'topic_parent',password:'parent-password',consent:true})).body.token;assert.equal((await api('/current-lessons',undefined,parent)).status,403);assert.equal((await api('/current-lessons')).status,401);
 }finally{await DB.sqlite.close()}
});

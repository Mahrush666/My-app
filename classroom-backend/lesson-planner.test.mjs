import {test} from 'node:test';import assert from 'node:assert/strict';
const {localDatabase}=await import(process.env.WORDQUEST_TEST_DATABASE==='postgres'?'../supabase/classroom/test-adapter.mjs':'./sqlite-adapter.mjs');
import {handle} from '../dist-classroom/worker.mjs';
const origin='https://mahrush666.github.io';
test('planner API authenticates, saves and reloads group plans, rejects stale saves and validates curriculum',async()=>{
 const DB=await localDatabase();const env={DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'test-planner-password'};let n=0;
 async function api(body,token,method=body?'POST':'GET'){const result=await handle(new Request('https://test/lesson-planner',{method,headers:{Origin:origin,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}),env);return {status:result.status,body:await result.json()}}
 async function call(path,body,token){const r=await handle(new Request('https://test'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'planner-'+n++,...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)}),env);return {status:r.status,body:await r.json()}}
 try{
 assert.equal((await api()).status,401);
 const owner=(await call('/teacher-login',{password:'test-planner-password'})).body.token;
 const group=(await call('/groups',{name:'Planner test group'},owner)).body.id;
 const parent=(await call('/register',{username:'planner_parent',password:'parent-password',consent:true})).body.token;
 assert.equal((await api(undefined,parent)).status,403);
 const base={revision:0,updatedAt:0};
 const extra={...base,kind:'lesson',id:'extra-test',groupId:group,book:'ACT2',unit:9,title:'CVC review',afterId:'act2-u9-lesson3',focus:'Short vowels'};
 assert.equal((await api({record:extra},owner)).status,200);
 const newUnit={...base,kind:'unit',id:'new-unit-draft',book:'ACT3',unit:11,title:'Extra phonics',notes:'More CVC practice'};
 const unitSaved=await api({record:newUnit},owner);assert.equal(unitSaved.status,200);assert(unitSaved.body.record.id.startsWith('unit-'));assert.equal(unitSaved.body.record.unit,11);
 assert.equal((await api({record:{...newUnit,id:'another-draft'}},owner)).status,409,'Duplicate unit numbers cannot create separate records');
 assert.equal((await api({record:{...newUnit,unit:3}},owner)).status,400,'Built-in units are already available');
 const addedLesson={...extra,id:'extra-new-unit',book:'ACT3',unit:11,afterId:'',title:'Short vowels'};assert.equal((await api({record:addedLesson},owner)).status,200);
 assert.equal((await api({record:{...base,kind:'progress',id:group,groupId:group,book:'ACT3',unit:11,lessonId:addedLesson.id,profileId:'',age:'',level:'',difficulty:'',notes:''}},owner)).status,200);
 const unitReload=(await api(undefined,owner)).body.records;assert(unitReload.some(r=>r.kind==='unit'&&r.unit===11&&r.title==='Extra phonics'));assert(unitReload.some(r=>r.kind==='progress'&&r.lessonId===addedLesson.id));
 const p={...base,kind:'plan',id:'test-plan',groupId:group,book:'ACT2',unit:9,lessonId:extra.id,title:'Friday CVC',date:'2026-11-27',duration:40,status:'draft',objectives:'Blend words',comments:'Bring tiles',blocks:[{id:'block-1',stage:'Warm-up',kind:'game',resourceId:'',title:'Sound game',minutes:5,instructions:'Say and blend',comments:'Pair work',url:'https://example.com/song'}]};
 const saved=await api({record:p},owner);assert.equal(saved.status,200);assert.equal(saved.body.record.revision,1);
 assert.equal((await api({record:p},owner)).status,409);
 const result=await api({record:{...saved.body.record,status:'ready'}},owner);assert.equal(result.status,200);assert.equal(result.body.record.revision,2);
 const loaded=await api(undefined,owner);assert.equal(loaded.status,200);assert(loaded.body.records.some(r=>r.id===p.id&&r.status==='ready'&&r.blocks[0].comments==='Pair work'));
 assert.equal((await api({record:{...p,id:'wrong-unit',unit:3}},owner)).status,400);
 assert.equal((await api({record:{...extra,revision:1,afterId:extra.id}},owner)).status,400);
 assert.equal((await api({record:{...p,id:'bad-url',blocks:[{...p.blocks[0],url:'javascript:alert(1)'}]}},owner)).status,400);
 const id='planner-staff';await DB.prepare('INSERT INTO staff_accounts(id,name,username,role,permissions,groups_json,active,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(id,'Planner teacher','planner_teacher','teacher','["materials"]',JSON.stringify([group]),1,0).run();
 const token='a'.repeat(64);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');
 await DB.prepare('INSERT INTO sessions VALUES(?,?,?,?)').bind(hash,id,'teacher',Date.now()+60000).run();
 const other=(await call('/groups',{name:'Other group'},owner)).body.id;
 assert.equal((await api({record:{...extra,id:'extra-other',groupId:other}},token)).status,403);
 assert((await api(undefined,token)).body.records.every(r=>!r.groupId||r.groupId===group));
 }finally{await DB.sqlite.close()}
});

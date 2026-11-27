import {plannerUnits} from '../lib/lesson-planner';
import {lessons} from '../github-pages/lessons';
import type {D1Database} from '@cloudflare/workers-types';
import type {StaffAccess} from '../lib/staff';
import type {PlannerRecord,PlannerKind,CurrentGroupLesson} from '../lib/lesson-planner';
export class PlannerError extends Error{constructor(message:string,public status=400){super(message)}}
function fail(message:string,status=400):never{throw new PlannerError(message,status)}
function str(value:unknown,max:number,required=false){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))return fail('Check the required text fields and their length.');return value.trim()}
function num(value:unknown,min:number,max:number){if(!Number.isInteger(value)||Number(value)<min||Number(value)>max)return fail('Choose a valid whole number.');return Number(value)}
function id(value:unknown,optional=false){const v=str(value,100,!optional);if(v&&!/^[a-zA-Z0-9_-]+$/.test(v))return fail('Invalid record identifier.');return v}
function url(value:unknown){const v=str(value,2000);if(v){try{const u=new URL(v);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)fail('Use an ordinary http or https resource link.')}catch{fail('Use a valid http or https resource link.')}}return v}
export function validatePlannerRecord(raw:unknown):PlannerRecord{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return fail('Choose a planner record.');const r=raw as Record<string,unknown>;
 const kind=r.kind as PlannerKind,base={id:id(r.id),revision:num(r.revision,0,100000000),updatedAt:0};
 if(kind==='resource'){const resourceKind=r.resourceKind;if(!['song','game','activity'].includes(String(resourceKind)))fail('Choose a resource type.');return {...base,kind,resourceKind:resourceKind as 'song'|'game'|'activity',title:str(r.title,160,true),skills:str(r.skills,500),levels:str(r.levels,500),minutes:num(r.minutes,0,240),materials:str(r.materials,4000),instructions:str(r.instructions,10000),url:url(r.url)}}
 if(kind==='unit')return {...base,kind,book:str(r.book,120,true),unit:num(r.unit,0,100),title:str(r.title,160,true),notes:str(r.notes,4000)};
 if(kind==='profile')return {...base,kind,title:str(r.title,160,true),age:str(r.age,100),level:str(r.level,200),difficulty:str(r.difficulty,200),recommendations:str(r.recommendations,10000)};
 const shared={...base,groupId:id(r.groupId,kind==='lesson'),book:str(r.book,120,true),unit:num(r.unit,0,100)};
 if(kind==='progress'){if(base.id!==shared.groupId)fail('Class progress must match its class.');return {...shared,kind,lessonId:id(r.lessonId,true),profileId:id(r.profileId,true),age:str(r.age,100),level:str(r.level,200),difficulty:str(r.difficulty,200),notes:str(r.notes,4000)}}
 if(kind==='lesson'){if(!base.id.startsWith('extra-'))fail('Additional lessons need a new identifier.');return {...shared,kind,title:str(r.title,160,true),afterId:id(r.afterId,true),focus:str(r.focus,4000)}}
 if(kind==='plan'){
  if(!['draft','ready'].includes(String(r.status)))fail('Choose draft or ready.');const date=str(r.date,10);if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date))fail('Choose a valid lesson date.');
  if(!Array.isArray(r.blocks)||r.blocks.length>60)fail('Use up to 60 activity blocks.');
  const blocks=r.blocks.map((b:any)=>{if(!b||typeof b!=='object'||!['song','game','activity','notes'].includes(b.kind))return fail('Choose a valid activity block.');return {id:id(b.id),stage:str(b.stage,120,true),kind:b.kind,resourceId:id(b.resourceId,true),title:str(b.title,160),minutes:num(b.minutes,0,240),instructions:str(b.instructions,10000),comments:str(b.comments,4000),url:url(b.url)}});
  if(new Set(blocks.map(b=>b.id)).size!==blocks.length)fail('Activity blocks must have distinct identifiers.');
  return {...shared,kind,lessonId:id(r.lessonId),title:str(r.title,160,true),date,duration:num(r.duration,5,480),status:r.status as 'draft'|'ready',objectives:str(r.objectives,8000),comments:str(r.comments,8000),blocks};
 }
 return fail('Unknown planner record type.');
}
const prefix='lesson_planner:';
async function groupAccess(db:D1Database,access:StaffAccess,group:string){if(!access.owner&&!access.groups.includes(group))fail('You do not have access to this class.',403);if(!await db.prepare('SELECT id FROM groups WHERE id=?').bind(group).first())fail('Class not found.',404)}
export async function lessonPlanner(db:D1Database,access:StaffAccess|null,method:string,data:Record<string,unknown>,now:number){
 if(!access)fail('Teacher access required.',403);
 if(!access.owner&&!access.permissions.includes('materials'))fail('Lesson planning requires Materials permission.',403);
 if(method==='GET'){
  const rows=await db.prepare("SELECT key,value FROM config WHERE key LIKE 'lesson_planner:%'").all<{key:string;value:string}>();
  const records=rows.results.map(row=>JSON.parse(row.value) as PlannerRecord).filter(r=>!('groupId' in r)||!r.groupId||access.owner||access.groups.includes(r.groupId));return {records};
 }
 if(method!=='POST')fail('Method not allowed.',405);
 const record=validatePlannerRecord(data.record);
 if('groupId' in record&&record.groupId)await groupAccess(db,access,record.groupId);

 async function curriculumEntry(lessonId:string){
  const builtIn=lessons.find(l=>l.id===lessonId);if(builtIn)return {book:builtIn.book,unit:builtIn.unit?.number||0,groupId:'',afterId:''};
  const row=await db.prepare('SELECT value FROM config WHERE key=?').bind(prefix+'lesson:'+lessonId).first<{value:string}>();return row?JSON.parse(row.value) as {book:string;unit:number;groupId:string;afterId:string}:null;
 }
 if(record.kind==='plan'||record.kind==='progress'||record.kind==='lesson'){
  const reference=record.kind==='lesson'?record.afterId:record.lessonId;
  if(reference){const entry=await curriculumEntry(reference);if(!entry||entry.book!==record.book||entry.unit!==record.unit||(entry.groupId&&entry.groupId!==record.groupId))fail('Choose a lesson in this book, unit and group.');}
  if(record.kind==='lesson'){
   let anchor=record.afterId;const visited=new Set([record.id]);
   while(anchor){if(visited.has(anchor))fail('A lesson cannot be placed after itself or its descendants.');visited.add(anchor);anchor=(await curriculumEntry(anchor))?.afterId||'';if(visited.size>200)fail('This teaching sequence is too long.');}
  }
 }
 if(record.kind==='unit'){
  if(plannerUnits(record.book,lessons,[]).some(u=>u.number===record.unit))fail('This unit is already listed. Select it from the unit dropdown and add its lessons.');
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(record.book));
  const bookKey=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('').slice(0,24);
  record.id='unit-'+bookKey+'-'+record.unit;
 }
 const key=prefix+record.kind+':'+record.id;
 const old=await db.prepare('SELECT value FROM config WHERE key=?').bind(key).first<{value:string}>();
 const previous=old?JSON.parse(old.value) as PlannerRecord:null;
 if(previous&&'groupId' in previous&&previous.groupId)await groupAccess(db,access,previous.groupId);
 if(previous&&('groupId' in previous)&&('groupId' in record)&&previous.groupId!==record.groupId)fail('Duplicate this record to move it to another class.');
 if((previous?.revision||0)!==record.revision)fail('This record was changed in another window. Reload the planner before saving.',409);
 const topicDate=record.kind==='progress'?{topicUpdatedAt:previous?.kind==='progress'&&previous.book===record.book&&previous.unit===record.unit&&previous.lessonId===record.lessonId?previous.topicUpdatedAt??previous.updatedAt:now}:{};
 const saved={...record,...topicDate,revision:record.revision+1,updatedAt:now};const value=JSON.stringify(saved);if(value.length>100000)fail('This record is too large. Split the plan into shorter lessons.',413);
 const result=old?await db.prepare('UPDATE config SET value=? WHERE key=? AND value=? RETURNING key').bind(value,key,old.value).first():await db.prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO NOTHING RETURNING key').bind(key,value).first();
 if(!result)fail('This record was changed in another window. Reload before saving.',409);
 return {record:saved};
}

// Attendance readers receive only group topic summaries, not private plans or profile notes.
export async function currentGroupLessons(db:D1Database,access:StaffAccess|null):Promise<{lessons:CurrentGroupLesson[]}>{
 if(!access||(!access.owner&&!access.permissions.some(p=>['attendance','schedule','materials'].includes(p))))fail('Attendance or lesson planning permission is required.',403);
 const rows=await db.prepare("SELECT key,value FROM config WHERE key LIKE 'lesson_planner:progress:%' OR key LIKE 'lesson_planner:lesson:%'").all<{key:string;value:string}>();
 const records=rows.results.map(row=>JSON.parse(row.value) as PlannerRecord);
 return {lessons:records.filter(r=>r.kind==='progress'&&(access.owner||access.groups.includes(r.groupId))).map(r=>{
  if(r.kind!=='progress')throw new Error('Invalid progress record');
  const builtIn=lessons.find(l=>l.id===r.lessonId&&l.book===r.book&&(l.unit?.number||0)===r.unit);
  const custom=records.find(l=>l.kind==='lesson'&&l.id===r.lessonId&&l.book===r.book&&l.unit===r.unit&&(!l.groupId||l.groupId===r.groupId));
  return {groupId:r.groupId,book:r.book,unit:r.unit,lessonId:r.lessonId,title:builtIn?.lessonTitle||builtIn?.title||(custom?.kind==='lesson'?custom.title:''),changedAt:r.topicUpdatedAt??r.updatedAt};
 })};
}

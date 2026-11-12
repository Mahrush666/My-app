import type {D1Database} from '@cloudflare/workers-types';
import {lessonHomeworkStatuses,lessonParticipation,type RewardProgram} from '../lib/reward-program';
import {validDay} from '../lib/teacher-dashboard';
import {programKey,rewardProgram} from './reward-program';
import {StaffError} from './staff';

const scope=`FROM children c LEFT JOIN group_campuses gc ON gc.group_id=c.group_id WHERE COALESCE(gc.campus_id,'main')=?`;
const object=(value:unknown):Record<string,unknown>|null=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null;
const bounded=(value:unknown,limit:number):value is string=>typeof value==='string'&&value.length>0&&value.length<=limit;
const points=(x:unknown,max:number)=>Number.isInteger(x)&&Math.abs(Number(x))<=max;
const validDate=(v:unknown):v is string=>typeof v==='string'&&validDay(v)&&v>='2020-01-01'&&v<='2100-12-31';
function validProgram(value:unknown):value is RewardProgram{
 const p=object(value);
 if(!p||!Array.isArray(p.semesters)||p.semesters.length>100||!Array.isArray(p.rules)||p.rules.length>100||!object(p.tracks))return false;
 const {semesters,rules}=p;
 if(!semesters.every((s,i)=>object(s)&&bounded(s.name,80)&&validDate(s.start)&&(!i||s.start>semesters[i-1].start)))return false;
 if(!rules.every((r,i)=>object(r)&&validDate(r.effective)&&(!i||r.effective>rules[i-1].effective)&&points(r.target,1000)&&r.target>0&&object(r.rates)
  &&Object.values(r.rates).every(value=>{const rate=object(value);return rate&&points(rate.attendance,1000)&&Number(rate.attendance)>=0&&points(rate.homework,1000)&&Number(rate.homework)>=0;})))return false;
 return Object.values(p.tracks as Record<string,unknown>).every(track=>['general','kinders','achievers','advancers'].includes(String(track)));
}
export async function exportRewardsBackup(db:D1Database,campus:string,now:number){
 const [program,awards,settings]=await Promise.all([
  rewardProgram(db,campus),
  db.prepare(`SELECT e.* FROM reward_events e JOIN (SELECT c.id ${scope}) c ON c.id=e.child_id
   WHERE e.kind IN ('manual','badge','diamond') ORDER BY e.created_at,e.id`).bind(campus).all(),
  db.prepare(`SELECT q.key,q.value FROM config q JOIN (SELECT c.id ${scope}) c
   ON q.key=('diamond_challenge:' || c.id) OR (q.key>=('lesson_reward:' || c.id || ':') AND q.key<('lesson_reward:' || c.id || ';'))
   ORDER BY q.key`).bind(campus).all(),
 ]);
 return {version:1,campus,exportedAt:now,program,awards:awards.results,settings:settings.results};
}
export async function restoreRewardsBackup(db:D1Database,campus:string,input:unknown,preview:boolean,now:number){
 const backup=object(input);
 const invalid=()=>new StaffError('Choose a valid rewards backup from this campus.',400);
 if(!backup||backup.version!==1||backup.campus!==campus||!validProgram(backup.program)||
  !Array.isArray(backup.awards)||!Array.isArray(backup.settings)||backup.awards.length+backup.settings.length>2400)throw invalid();
 const [roster,meetings]=await Promise.all([
  db.prepare(`SELECT c.id ${scope}`).bind(campus).all<{id:string}>(),
  db.prepare(`SELECT m.id FROM class_meetings m LEFT JOIN group_campuses gc ON gc.group_id=m.group_id
   WHERE COALESCE(gc.campus_id,'main')=?`).bind(campus).all<{id:string}>(),
 ]);
 const children=new Set(roster.results.map(r=>r.id)),meetingIds=new Set(meetings.results.map(r=>r.id));
 const awards:unknown[][]=[],settings:unknown[][]=[];
 let skipped=0;
 for(const value of backup.awards){
  const a=object(value);
  if(!a||!bounded(a.child_id,80)||!bounded(a.id,80)||!bounded(a.source,200)||!bounded(a.label,200)||
   !['manual','badge','diamond'].includes(String(a.kind))||!a.source.startsWith(String(a.kind)+':')&&!(a.kind==='diamond'&&a.source==='diamond')||
   !points(a.xp,100)||!Number.isSafeInteger(a.created_at)||Number(a.created_at)<=0||Number(a.created_at)>now||
   (a.revoked!==0&&a.revoked!==1))throw invalid();
  if(!children.has(a.child_id)){skipped++;continue;}
  awards.push([a.id,a.child_id,a.source,a.kind,a.label,a.xp,a.created_at,a.revoked]);
 }
 for(const value of backup.settings){
  const s=object(value);
  if(!s||!bounded(s.key,300)||!bounded(s.value,4000))throw invalid();
  const [type,child,meeting,...extra]=s.key.split(':');
  if(extra.length||!child||!['diamond_challenge','lesson_reward'].includes(type))throw invalid();
  let record:Record<string,unknown>|null;
  try{record=object(JSON.parse(s.value));}catch{throw invalid();}
  if(!record)throw invalid();
  if(type==='diamond_challenge'){
   if(meeting||!bounded(record.title,100)||!bounded(record.description,400)||!bounded(record.category,40)||!Number.isSafeInteger(record.assignedAt))throw invalid();
  }else{
   if(!meeting||!lessonHomeworkStatuses.includes(record.homework as typeof lessonHomeworkStatuses[number])||
    !lessonParticipation.includes(record.participation as typeof lessonParticipation[number])||
    !points(record.extra,1000)||typeof record.note!=='string'||record.note.length>240)throw invalid();
  }
  if(!children.has(child)||type==='lesson_reward'&&!meetingIds.has(meeting)){skipped++;continue;}
  settings.push([s.key,s.value]);
 }
 const programExists=await db.prepare('SELECT key FROM config WHERE key=?').bind(programKey(campus)).first();
 if(preview)return {awards:awards.length,settings:settings.length,skipped,program:!programExists};
 const statements=[];
 if(!programExists)statements.push(db.prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO NOTHING').bind(programKey(campus),JSON.stringify(backup.program)));
 for(let i=0;i<awards.length;i+=30){
  const rows=awards.slice(i,i+30);
  statements.push(db.prepare(`INSERT INTO reward_events(id,child_id,source,kind,label,xp,created_at,revoked)
   VALUES ${rows.map(()=>'(?,?,?,?,?,?,?,?)').join(',')} ON CONFLICT DO NOTHING`).bind(...rows.flat()));
 }
 for(let i=0;i<settings.length;i+=60){
  const rows=settings.slice(i,i+60);
  statements.push(db.prepare(`INSERT INTO config(key,value) VALUES ${rows.map(()=>'(?,?)').join(',')} ON CONFLICT DO NOTHING`).bind(...rows.flat()));
 }
 const applied=statements.length?(await db.batch(statements)).reduce((sum,row)=>sum+row.meta.changes,0):0;
 return {saved:true,applied,skipped};
}

import type {D1Database} from '@cloudflare/workers-types';
import {emptyRewardProgram,weeklyRates,type DiamondChallenge,type RewardProgram} from '../lib/reward-program';
import {chinaDay,validDay} from '../lib/teacher-dashboard';
import {StaffError} from './staff';

export const programKey=(campus:string)=>'reward_program:'+campus;
export const lessonRewardKey=(child:string,meeting:string)=>'lesson_reward:'+child+':'+meeting;
export const challengeKey=(child:string)=>'diamond_challenge:'+child;
export async function rewardProgram(db:D1Database,campus:string){
 const row=await db.prepare('SELECT value FROM config WHERE key=?').bind(programKey(campus)).first<{value:string}>();
 return row?JSON.parse(row.value) as RewardProgram:emptyRewardProgram;
}
export async function diamondChallenge(db:D1Database,child:string){
 const row=await db.prepare('SELECT value FROM config WHERE key=?').bind(challengeKey(child)).first<{value:string}>();
 return row?JSON.parse(row.value) as DiamondChallenge:undefined;
}
export function lessonRates(program:RewardProgram,meeting:{id:string;day:string}){
 const rule=program.rules.findLast(v=>v.effective<=meeting.day);
 return rule?.rates[meeting.id.replace(/-\d+$/,'')]??{attendance:10,homework:10};
}
export function currentSemester(program:RewardProgram,day:string){
 return program.semesters.findLast(s=>s.start<=day);
}
export function saveSetting(db:D1Database,key:string,value:unknown){
 return db.prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key,JSON.stringify(value));
}
export async function rulePreview(db:D1Database,campus:string,effective:string,target:number){
 const rows=await db.prepare(`SELECT m.id,m.group_id,g.name FROM meeting_series m JOIN groups g ON g.id=m.group_id
  LEFT JOIN group_campuses gc ON gc.group_id=g.id
  WHERE COALESCE(gc.campus_id,'main')=? AND m.start_day<=? AND (m.end_day IS NULL OR m.end_day>=?)
  AND (m.end_day IS NULL OR m.end_day>m.start_day) ORDER BY m.start_day,m.time,m.id`).bind(campus,effective,effective).all<{id:string;group_id:string;name:string}>();
 const groups=new Map<string,{name:string;ids:string[]}>();
 for(const row of rows.results){
  const group=groups.get(row.group_id)??{name:row.name,ids:[]};
  group.ids.push(row.id);
  groups.set(row.group_id,group);
 }
 return [...groups.values()].map(group=>({name:group.name,rates:weeklyRates(group.ids,target)}));
}
export async function updateRewardProgram(db:D1Database,campus:string,data:Record<string,unknown>,now:number){
 const old=await rewardProgram(db,campus);
 const today=chinaDay(now);
 const string=(x:unknown)=>typeof x==='string'?x.trim():'';
 if(data.action==='semester'){
  const name=string(data.name),start=string(data.start);
  if(!name||name.length>80||!validDay(start)||start<today||old.semesters.some(s=>s.start>=start)){
   throw new StaffError('Enter a semester name and a start date after the last semester start.',400);
  }
  return writeProgram(db,campus,old,{...old,semesters:[...old.semesters,{name,start}]});
 }
 if(data.action==='rules'||data.action==='preview'){
  const effective=string(data.effective),target=Number(data.target);
  if(!validDay(effective)||effective<=today||!Number.isInteger(target)||target<1||target>1000){
   throw new StaffError('Choose a future date and a weekly target from 1 to 1,000 XP.',400);
  }
  const preview=await rulePreview(db,campus,effective,target);
  if(!preview.length)throw new StaffError('Add recurring classes before setting a weekly XP target.',400);
  if(data.action==='preview')return {preview};
  if(old.rules.some(rule=>rule.effective>=effective))throw new StaffError('Choose a date after the last saved XP rule.',400);
  const rates=Object.assign({},...preview.map(group=>group.rates)) as RewardProgram['rules'][number]['rates'];
  return writeProgram(db,campus,old,{...old,rules:[...old.rules,{effective,target,rates}]});
 }
 if(data.action==='track'){
  const groupId=string(data.groupId),track=string(data.track) as RewardProgram['tracks'][string];
  if(!['general','kinders','achievers','advancers'].includes(track)||!await db.prepare(`SELECT g.id FROM groups g LEFT JOIN group_campuses gc ON gc.group_id=g.id
   WHERE g.id=? AND COALESCE(gc.campus_id,'main')=?`).bind(groupId,campus).first()){
   throw new StaffError('Choose a badge track and a class in this campus.',400);
  }
  return writeProgram(db,campus,old,{...old,tracks:{...old.tracks,[groupId]:track}});
 }
 throw new StaffError('Choose a rewards setting to save.',400);
}

async function writeProgram(db:D1Database,campus:string,previous:RewardProgram,next:RewardProgram){
 const key=programKey(campus);
 const expected=JSON.stringify(previous);
 const result=await db.prepare(`INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value
  WHERE config.value=?`).bind(key,JSON.stringify(next),expected).run();
 if(!result.meta.changes)throw new StaffError('Rewards settings changed. Refresh before saving again.',409);
 return {saved:true};
}

export async function childRewardContext(db:D1Database,id:string){
 const row=await db.prepare(`SELECT c.group_id,COALESCE(gc.campus_id,'main') AS campus_id FROM children c
  LEFT JOIN group_campuses gc ON gc.group_id=c.group_id WHERE c.id=?`).bind(id).first<{group_id:string;campus_id:string}>();
 if(!row)throw new StaffError('Student not found.',404);
 return {...row,program:await rewardProgram(db,row.campus_id)};
}

import type {D1Database} from '@cloudflare/workers-types';
import {requiresAnswers} from '../lib/homework-completion';
import {attendanceXP,homeworkXP,rewardSummary,type RewardEntry} from '../lib/rewards';
import {chinaWeek} from '../lib/student-dashboard';
import {chinaDay,validDay} from '../lib/teacher-dashboard';
import {campusClassNames} from '../lib/campus-attendance';
import {emptyLessonReward,lessonRewardPoints,type LessonRates,type LessonReward} from '../lib/reward-program';
import {currentSemester,diamondChallenge,lessonRates,rewardProgram} from './reward-program';

const dayTime=(day:string)=>Date.parse(day+'T00:00:00+08:00');
type RewardRoster={id:string;name:string;group_id:string;campus_id:string};
type CalendarReward={child_id:string;meeting_id:string;day:string;campus_id:string;status:string;settings:string|null;rate_value:string|null};
type StoredReward=RewardEntry & {child_id:string};

async function rewardLedger(db:D1Database,scope:{child?:string;group?:string;campus?:string},now:number){
 const today=chinaDay(now);
 const scopeColumn=scope.child?'c.id':scope.group?'c.group_id':"COALESCE(gc.campus_id,'main')";
 const scopeValue=scope.child??scope.group??scope.campus;
 const rosterSQL=`SELECT c.id,c.name,c.group_id,COALESCE(gc.campus_id,'main') AS campus_id
  FROM children c LEFT JOIN group_campuses gc ON gc.group_id=c.group_id
  WHERE ${scopeColumn}=? ${scope.child?'':'AND c.approved=1'}`;
 const roster=(await db.prepare(rosterSQL+' ORDER BY c.name,c.id').bind(scopeValue).all<RewardRoster>()).results;
 if(!roster.length)return [];
 const [events,calendar,ht]=await Promise.all([
  db.prepare(`SELECT e.* FROM reward_events e JOIN (${rosterSQL}) c ON c.id=e.child_id`).bind(scopeValue).all<StoredReward>(),
  db.prepare(`SELECT a.child_id,a.meeting_id,m.day,COALESCE(gc.campus_id,'main') AS campus_id,a.status,q.value AS settings,f.value AS rate_value
   FROM attendance a JOIN (${rosterSQL}) c ON c.id=a.child_id JOIN class_meetings m ON m.id=a.meeting_id
   LEFT JOIN group_campuses gc ON gc.group_id=m.group_id
   LEFT JOIN config q ON q.key=('lesson_reward:' || a.child_id || ':' || m.id)
   LEFT JOIN config f ON f.key=('reward_meeting_rate:' || m.id)
   WHERE m.day<=? AND (a.status IN ('present','late') OR q.key IS NOT NULL)`).bind(scopeValue,today).all<CalendarReward>(),
  db.prepare(`SELECT c.id AS child_id,q.key,q.value FROM config q JOIN (${rosterSQL}) c
   ON substr(q.key,length(q.key)-length(c.id))=(':' || c.id)
   WHERE q.key>='campus_attendance:' AND q.key<'campus_attendance;'`).bind(scopeValue).all<{child_id:string;key:string;value:string}>(),
 ]);
 const programs=new Map(await Promise.all([...new Set([...roster.map(c=>c.campus_id),...calendar.results.map(m=>m.campus_id)])]
  .map(async campus=>[campus,await rewardProgram(db,campus)] as const)));
 const records=new Map(roster.map(c=>[c.id,[] as RewardEntry[]]));
 for(const {child_id,...entry} of events.results)records.get(child_id)?.push(entry);
 const scheduled=new Map<string,number>();
 for(const mark of calendar.results){
  const present=mark.status==='present'||mark.status==='late';
  const rates=mark.rate_value?JSON.parse(mark.rate_value) as LessonRates:lessonRates(programs.get(mark.campus_id)!,{id:mark.meeting_id,day:mark.day});
  const extra=mark.settings?JSON.parse(mark.settings) as LessonReward:emptyLessonReward;
  const breakdown=lessonRewardPoints(extra,rates,present);
  const id='attendance:'+mark.meeting_id;
  if(present){
   const key=mark.child_id+':'+mark.campus_id+':'+mark.day;
   scheduled.set(key,(scheduled.get(key)??0)+1);
  }
  records.get(mark.child_id)?.push({id,source:id,kind:mark.settings?'lesson':'attendance',label:mark.settings?'Lesson record':'Class attendance',
   xp:Object.values(breakdown).reduce((sum,x)=>sum+x,0),created_at:dayTime(mark.day),revoked:0,breakdown,note:extra.note});
 }
 for(const mark of ht.results){
  const [,campus,day,child]=mark.key.split(':');
  if(child!==mark.child_id||!validDay(day)||day>today)continue;
  const {status,lessons}=JSON.parse(mark.value) as {status:string;lessons:string};
  if(status!=='present'&&status!=='late')continue;
  const names=[...new Set(campusClassNames(lessons).map(name=>name.toLowerCase()))];
  const additional=Math.max(0,names.length-(scheduled.get(child+':'+campus+':'+day)??0));
  if(!additional)continue;
  const id='ht:'+campus+':'+day;
  records.get(child)?.push({id,source:id,kind:'ht-attendance',label:'HT daily attendance · '+additional+' class'+(additional===1?'':'es'),
   xp:additional*attendanceXP,created_at:dayTime(day),revoked:0});
 }
 return roster.map(child=>({child,program:programs.get(child.campus_id)!,history:records.get(child.id)!}));
}

export async function readRewards(db:D1Database,childId:string,now:number,includeNotes=false){
 const [row]=await rewardLedger(db,{child:childId},now);
 if(!row)return rewardSummary([]);
 const semester=currentSemester(row.program,chinaDay(now));
 const history=row.history.map(({note,...entry})=>includeNotes?{...entry,note}:entry).sort((a,b)=>Number(b.created_at)-Number(a.created_at)||a.id.localeCompare(b.id));
 const total=rewardSummary(history);
 const current=semester?rewardSummary(history.filter(h=>Number(h.created_at)>=dayTime(semester.start))):total;
 const challenge=await diamondChallenge(db,childId);
 return {...current,history,lifetimeXP:total.xp,badges:total.badges,semester,track:row.program.tracks[row.child.group_id]||'general',
  challenge:challenge&&(!semester||challenge.assignedAt>=dayTime(semester.start))?challenge:undefined};
}

export async function rewardRosterTotals(db:D1Database,scope:{group?:string;campus?:string},now:number){
 const week=chinaWeek(now),today=chinaDay(now);
 return (await rewardLedger(db,scope,now)).map(({child,program,history})=>{
  const semester=currentSemester(program,today),start=semester?dayTime(semester.start):0;
  const active=history.filter(h=>!h.revoked&&Number(h.created_at)>=start);
  return {id:child.id,name:child.name,group_id:child.group_id,xp:active.reduce((n,h)=>n+Number(h.xp),0),
   diamond:active.some(h=>h.kind==='diamond')?1:0,
   weekly_xp:active.filter(h=>Number(h.created_at)>=week.start&&Number(h.created_at)<week.end).reduce((n,h)=>n+Number(h.xp),0),
   badges:history.filter(h=>h.kind==='badge'&&!h.revoked).length};
 });
}
export async function campusRewardActivity(db:D1Database,campus:string,groups:string[]|undefined,from:string,to:string,now:number){
 const roster=await rewardLedger(db,{campus},now);
 return roster.filter(({child})=>!groups||groups.includes(child.group_id))
  .flatMap(({child,history})=>history.filter(row=>{
   const day=chinaDay(Number(row.created_at));
   return (!from||day>=from)&&(!to||day<=to);
  }).map(({id,label,xp,created_at,revoked})=>({id,name:child.name,label,xp,created_at,revoked})))
  .sort((a,b)=>Number(b.created_at)-Number(a.created_at)||a.id.localeCompare(b.id)).slice(0,150);
}
export async function classRewardTotals(db:D1Database,groupId:string,now:number){
 return {results:await rewardRosterTotals(db,{group:groupId},now)};
}

// The unique child/source pair makes rescans, retries and concurrent requests safe.
// Assignment edits and deletion never erase previously earned points.
type RewardAssignment={id:string;activities:string;title:string;updated_at:number};
export function homeworkRewardStatement(db:D1Database,childId:string,a:RewardAssignment){
 const required=(JSON.parse(a.activities) as string[]).filter(requiresAnswers);
 if(!required.length)return [];
 return [db.prepare(`INSERT OR IGNORE INTO reward_events(id,child_id,source,kind,label,xp,created_at,revoked)
 SELECT ?,?,?,?,?,?,MAX(completed_at),0 FROM completions WHERE child_id=? AND assignment_id=?
 AND activity IN (${required.map(()=>'?').join(',')}) AND EXISTS(SELECT 1 FROM assignments WHERE id=? AND updated_at=?)
 HAVING COUNT(DISTINCT activity)=?`).bind(crypto.randomUUID(),childId,'homework:'+a.id,'homework',a.title||'Homework finished',homeworkXP,childId,a.id,...required,a.id,a.updated_at,required.length)];
}
export async function syncHomeworkRewards(db:D1Database,childId:string,assignments:RewardAssignment[]){
 const statements=assignments.flatMap(a=>homeworkRewardStatement(db,childId,a));
 for(let i=0;i<statements.length;i+=50)await db.batch(statements.slice(i,i+50));
}

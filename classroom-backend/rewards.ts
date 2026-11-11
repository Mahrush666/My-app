import type {D1Database} from '@cloudflare/workers-types';
import {requiresAnswers} from '../lib/homework-completion';
import {attendanceXP,homeworkXP,rewardSummary,type RewardEntry} from '../lib/rewards';
import {chinaWeek} from '../lib/student-dashboard';

const chinaDate=(at:number)=>new Date(at+8*3600000).toISOString().slice(0,10);
// Attendance already has one record per student and meeting. Read it directly so
// existing marks count and correcting a mark cannot leave stale or duplicate XP.
const attendedMeetings="FROM attendance a JOIN class_meetings m ON m.id=a.meeting_id WHERE a.status IN ('present','late') AND m.day<=?";
export async function readRewards(db:D1Database,childId:string,now:number){
 const rows=await db.prepare(`SELECT id,kind,source,label,xp,created_at,revoked,class_day FROM (
 SELECT id,child_id,source,kind,label,xp,created_at,revoked,NULL AS class_day FROM reward_events WHERE child_id=?
 UNION ALL SELECT 'attendance:' || a.meeting_id,a.child_id,'attendance:' || a.meeting_id,'attendance','Class attendance',${attendanceXP},NULL,0,m.day
 ${attendedMeetings} AND a.child_id=?
 ) r`).bind(childId,chinaDate(now),childId).all<RewardEntry & {class_day:string|null}>();
 const history=rows.results.map(({class_day,...row})=>({...row,created_at:class_day?Date.parse(class_day+'T00:00:00+08:00'):Number(row.created_at)}));
 return rewardSummary(history.sort((a,b)=>b.created_at-a.created_at||a.id.localeCompare(b.id)));
}

export function classRewardTotals(db:D1Database,groupId:string,now:number){
 const week=chinaWeek(now);
 return db.prepare(`SELECT c.id,c.name,COALESCE(SUM(r.xp),0) AS xp,COALESCE(MAX(CASE WHEN r.kind='diamond' THEN 1 ELSE 0 END),0) AS diamond,
 COALESCE(SUM(CASE WHEN (r.created_at>=? AND r.created_at<?) OR (r.class_day>=? AND r.class_day<?) THEN r.xp ELSE 0 END),0) AS weekly_xp
 FROM children c LEFT JOIN (
 SELECT child_id,xp,created_at,NULL AS class_day,kind FROM reward_events WHERE revoked=0
 UNION ALL SELECT a.child_id,${attendanceXP},NULL,m.day,'attendance' ${attendedMeetings}
 ) r ON r.child_id=c.id WHERE c.group_id=? AND c.approved=1 GROUP BY c.id,c.name ORDER BY c.name,c.id`)
 .bind(week.start,week.end,chinaDate(week.start),chinaDate(week.end),chinaDate(now),groupId).all<{id:string;name:string;xp:number;weekly_xp:number;diamond:number}>();
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

import type {D1Database} from '@cloudflare/workers-types';
import {chinaWeek} from '../lib/student-dashboard';
export async function studentDashboard(db:D1Database,child:{id:string;group_id:string},now:number){
 const week=chinaWeek(now),local=new Date(now+8*3600000).toISOString(),day=local.slice(0,10),time=local.slice(11,16);
 const nextClass=await db.prepare('SELECT day,time,duration FROM class_meetings WHERE group_id=? AND (day>? OR (day=? AND time>=?)) ORDER BY day,time LIMIT 1').bind(child.group_id,day,day,time).first();
 const rows=await db.prepare('SELECT c.id,c.name,COALESCE(SUM(r.xp),0) AS xp FROM children c LEFT JOIN reward_events r ON r.child_id=c.id AND r.revoked=0 AND r.created_at>=? AND r.created_at<? WHERE c.group_id=? AND c.approved=1 GROUP BY c.id,c.name ORDER BY c.name,c.id').bind(week.start,week.end,child.group_id).all<{id:string;name:string;xp:number}>();
 const classmates=rows.results.map(r=>({name:r.name.trim().split(/\s+/)[0],xp:Math.max(0,Number(r.xp)),me:r.id===child.id}));
 return {nextClass,weeklyXP:classmates.find(c=>c.me)?.xp||0,classmates,weekStart:new Date(week.start+8*3600000).toISOString().slice(0,10)};
}

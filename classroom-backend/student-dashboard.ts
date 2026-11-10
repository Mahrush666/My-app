import {classRewardTotals} from './rewards';
import {classReviewDays} from './review-days';
import type {D1Database} from '@cloudflare/workers-types';
import {ensureMeetings} from './meeting-series';
import {addDays} from '../lib/teacher-dashboard';
import {dailyEnabled} from './daily-practice';
import {chinaWeek} from '../lib/student-dashboard';
export async function studentDashboard(db:D1Database,child:{id:string;group_id:string},now:number){
 const week=chinaWeek(now),local=new Date(now+8*3600000).toISOString(),day=local.slice(0,10),time=local.slice(11,16);
 const [nextClass,rows,reviewDays,enabled]=await Promise.all([
  ensureMeetings(db,day,addDays(day,14),child.group_id).then(()=>db.prepare('SELECT day,time,duration FROM class_meetings WHERE group_id=? AND (day>? OR (day=? AND time>=?)) ORDER BY day,time LIMIT 1').bind(child.group_id,day,day,time).first()),
  classRewardTotals(db,child.group_id,now),
  classReviewDays(db,child.group_id,now),
  dailyEnabled(db,child.group_id),
 ]);
 const classmates=rows.results.map(r=>({reviewDays:[...(reviewDays.get(r.id)||[])].sort(),name:r.name.trim().split(/\s+/)[0],xp:Number(r.xp),weeklyXP:Number(r.weekly_xp),me:r.id===child.id}));
 return {today:day,reviewDays:[...(reviewDays.get(child.id)||[])].sort(),dailyEnabled:enabled,nextClass,weeklyXP:classmates.find(c=>c.me)?.weeklyXP||0,classmates,weekStart:new Date(week.start+8*3600000).toISOString().slice(0,10)};
}

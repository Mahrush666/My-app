import {classRewardTotals} from './rewards';
import type {D1Database} from '@cloudflare/workers-types';
import {chinaWeek} from '../lib/student-dashboard';
import type {ClassPractice} from '../lib/class-practice';
import {classReviewDays} from './review-days';
export async function classPractice(db:D1Database,groupId:string,now:number):Promise<ClassPractice>{
 const week=chinaWeek(now),date=(at:number)=>new Date(at+8*3600000).toISOString().slice(0,10);
 const [rows,days]=await Promise.all([
  classRewardTotals(db,groupId,now),
  classReviewDays(db,groupId,now)
 ]);
 return {groupId,today:date(now),weekStart:date(week.start),students:rows.results.map(r=>({id:r.id,name:r.name,reviewDays:[...(days.get(r.id)||[])].sort(),xp:Number(r.xp),weeklyXP:Number(r.weekly_xp)})).sort((a,b)=>b.reviewDays.length-a.reviewDays.length||b.weeklyXP-a.weeklyXP||a.name.localeCompare(b.name)||a.id.localeCompare(b.id))};
}

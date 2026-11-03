import type {D1Database} from '@cloudflare/workers-types';
import {chinaWeek} from '../lib/student-dashboard';
const chinaDate=(at:number)=>new Date(at+8*3600000).toISOString().slice(0,10);
// Extra review has no assignment attempt, so retain only a day marker, never an answer or recording.
export async function markReviewDay(db:D1Database,child:string,now:number){await db.prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO NOTHING').bind('review_day:'+chinaDate(now)+':'+child,'1').run()}
export async function classReviewDays(db:D1Database,group:string,now:number){
 const week=chinaWeek(now),until=Math.min(week.end,now+1);
 const [attempts,daily,flags]=await Promise.all([
 db.prepare('SELECT t.child_id,t.created_at FROM attempts t JOIN children c ON c.id=t.child_id WHERE c.group_id=? AND c.approved=1 AND t.created_at>=? AND t.created_at<?').bind(group,week.start,until).all<{child_id:string;created_at:number}>(),
 db.prepare('SELECT r.child_id,a.created_at FROM daily_answers a JOIN daily_runs r ON r.id=a.run_id JOIN children c ON c.id=r.child_id WHERE c.group_id=? AND c.approved=1 AND a.created_at>=? AND a.created_at<?').bind(group,week.start,until).all<{child_id:string;created_at:number}>(),
 db.prepare("SELECT key FROM config WHERE key>=? AND key<? AND value='1'").bind('review_day:'+chinaDate(week.start)+':','review_day:'+chinaDate(week.end)+':').all<{key:string}>()]);
 const map=new Map<string,Set<string>>();const add=(id:string,day:string)=>{if(day>chinaDate(now))return;if(!map.has(id))map.set(id,new Set());map.get(id)!.add(day)};
 for(const r of [...attempts.results,...daily.results])add(r.child_id,chinaDate(Number(r.created_at)));
 for(const r of flags.results)add(r.key.slice(22),r.key.slice(11,21));
 return map;
}

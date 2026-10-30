import type {D1Database} from '@cloudflare/workers-types';
import {addDays} from '../lib/teacher-dashboard';
// Expand only the requested window. The rule has no artificial final week.
export async function ensureMeetings(db:D1Database,from:string,to:string,groupId?:string){
 const rules=await db.prepare('SELECT * FROM meeting_series WHERE start_day<=? AND (end_day IS NULL OR end_day>=?)'+(groupId?' AND group_id=?':'')).bind(...(groupId?[to,from,groupId]:[to,from])).all<{id:string;group_id:string;start_day:string;end_day:string|null;time:string;duration:number}>();
 const statements=[];
 for(const r of rules.results){
 const offset=Math.max(0,Math.ceil((Date.parse(from)-Date.parse(r.start_day))/(7*86400000)));
 for(let i=offset;;i++){
 const day=addDays(r.start_day,i*7);if(day>to||(r.end_day&&day>r.end_day))break;
 const id=r.id+'-'+i;
 // Recheck the rule in the transaction: a concurrent deletion cannot revive a session.
 statements.push(db.prepare("INSERT OR IGNORE INTO class_meetings(id,group_id,day,time,duration) SELECT ?,s.group_id,?,s.time,s.duration FROM meeting_series s WHERE s.id=? AND (s.end_day IS NULL OR s.end_day>=?) AND NOT EXISTS(SELECT 1 FROM meeting_exceptions e WHERE e.series_id=s.id AND e.day=?)").bind(id,day,r.id,day,day));
 statements.push(db.prepare("INSERT OR IGNORE INTO attendance(meeting_id,child_id,status) SELECT m.id,c.id,'unmarked' FROM children c JOIN class_meetings m ON m.group_id=c.group_id WHERE m.id=? AND c.approved=1 AND changes()>0").bind(id));
 }
 }
 if(statements.length)await db.batch(statements);
}

import type {D1Database} from '@cloudflare/workers-types';
import {validDay,addDays} from '../lib/teacher-dashboard';
// Called only after the existing teacher authorization check.
export async function teacherTools(db:D1Database,path:string,method:string,data:Record<string,unknown>,url:URL){
 const check=(ok:unknown,message:string)=>{if(!ok)throw Object.assign(new Error(message),{status:400})};
 const str=(x:unknown)=>typeof x==='string'?x.trim():'';
 if(path==='/calendar'&&method==='GET'){
 const from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'';
 check(validDay(from)&&validDay(to)&&to>=from&&to<=addDays(from,62),'Choose a date range of at most 63 days.');
 const meetings=await db.prepare('SELECT * FROM class_meetings WHERE day>=? AND day<=? ORDER BY day,time').bind(from,to).all();
 const marks=await db.prepare('SELECT a.*,c.name FROM attendance a JOIN children c ON c.id=a.child_id JOIN class_meetings m ON m.id=a.meeting_id WHERE m.day>=? AND m.day<=?').bind(from,to).all();
 return {meetings:meetings.results,marks:marks.results};
 }
 if(path==='/schedule'&&method==='POST'){
 const groupId=str(data.groupId),day=str(data.day),time=str(data.time),duration=Number(data.duration),weeks=Number(data.weeks),eventId=str(data.eventId);
 check(await db.prepare('SELECT id FROM groups WHERE id=?').bind(groupId).first(),'Choose a class.');
 check(validDay(day)&&day>='2020-01-01'&&day<='2100-12-31','Choose a valid date.');
 check(/^([01]\d|2[0-3]):[0-5]\d$/.test(time),'Choose a start time.');
 check(Number.isInteger(duration)&&duration>=5&&duration<=480,'Duration must be 5–480 minutes.');
 check(Number.isInteger(weeks)&&weeks>=1&&weeks<=16,'Repeat for 1–16 weeks.');
 check(/^[a-zA-Z0-9-]{16,80}$/.test(eventId),'Missing schedule identifier.');
 const statements=[];
 for(let i=0;i<weeks;i++){
 const id=eventId+'-'+i;
 statements.push(db.prepare('INSERT OR IGNORE INTO class_meetings(id,group_id,day,time,duration) VALUES(?,?,?,?,?)').bind(id,groupId,addDays(day,i*7),time,duration));
 // Snapshot the roster; future class transfers do not rewrite attendance history.
 statements.push(db.prepare("INSERT OR IGNORE INTO attendance(meeting_id,child_id,status) SELECT m.id,c.id,'unmarked' FROM children c JOIN class_meetings m ON m.group_id=c.group_id WHERE m.id=? AND c.approved=1").bind(id));
 }
 await db.batch(statements);return {saved:true};
 }
 if(path==='/attendance'&&method==='POST'){
 const id=str(data.meetingId);
 const entries=Array.isArray(data.marks)?data.marks:[{childId:data.childId,status:data.status}];
 check(entries.length>0&&entries.length<=500,'Choose 1–500 attendance records.');
 const roster=await db.prepare('SELECT c.id FROM children c JOIN class_meetings m ON m.id=? WHERE ((c.group_id=m.group_id AND c.approved=1) OR EXISTS(SELECT 1 FROM attendance a WHERE a.meeting_id=m.id AND a.child_id=c.id))').bind(id).all<{id:string}>();
 const allowed=new Set(roster.results.map(c=>c.id)),seen=new Set<string>(),statements=[];
 for(const entry of entries){
 check(entry&&typeof entry==='object','Choose an attendance record.');
 const row=entry as Record<string,unknown>,childId=str(row.childId),status=str(row.status);
 check(['present','absent','late','excused','unmarked'].includes(status),'Choose an attendance status.');
 check(allowed.has(childId),'This student is not in this class.');
 check(!seen.has(childId),'A student can only appear once.');seen.add(childId);
 statements.push(db.prepare('INSERT INTO attendance(meeting_id,child_id,status) VALUES(?,?,?) ON CONFLICT(meeting_id,child_id) DO UPDATE SET status=excluded.status').bind(id,childId,status));
 }
 await db.batch(statements);return {saved:true,count:statements.length};
 }
 if(path==='/delete-meeting'&&method==='POST'){
 const id=str(data.id);await db.batch([db.prepare('DELETE FROM attendance WHERE meeting_id=?').bind(id),db.prepare('DELETE FROM class_meetings WHERE id=?').bind(id)]);return {saved:true};
 }
 if(path==='/rename-group'&&method==='POST'){
 const name=str(data.name);check(name&&name.length<=80,'Enter a class name up to 80 characters.');await db.prepare('UPDATE groups SET name=? WHERE id=?').bind(name,str(data.id)).run();return {saved:true};
 }
 if(path==='/delete-student'&&method==='POST'){
 const id=str(data.id);check(data.confirm===true,'Confirm student deletion.');
 // All private QR access and dependent records are removed in one transaction.
 const statements=[db.prepare('DELETE FROM student_sessions WHERE child_id=?').bind(id)];
 for(const table of ['student_links','student_claims','attendance','reward_events','reviews','attempts','completions'])statements.push(db.prepare('DELETE FROM '+table+' WHERE child_id=?').bind(id));
 statements.push(db.prepare('DELETE FROM children WHERE id=?').bind(id));await db.batch(statements);return {saved:true};
 }
 if(path==='/delete-group'&&method==='POST'){
 const id=str(data.id);check(data.confirm===true,'Confirm class deletion.');check(!await db.prepare('SELECT id FROM children WHERE group_id=? LIMIT 1').bind(id).first(),'Move or delete the students before deleting this class.');
 await db.batch([
 db.prepare('DELETE FROM attendance WHERE meeting_id IN (SELECT id FROM class_meetings WHERE group_id=?)').bind(id),db.prepare('DELETE FROM class_meetings WHERE group_id=?').bind(id),
 db.prepare('DELETE FROM attempts WHERE assignment_id IN (SELECT id FROM assignments WHERE group_id=?)').bind(id),db.prepare('DELETE FROM completions WHERE assignment_id IN (SELECT id FROM assignments WHERE group_id=?)').bind(id),db.prepare('DELETE FROM assignments WHERE group_id=?').bind(id),db.prepare('DELETE FROM groups WHERE id=?').bind(id)]);return {saved:true};
 }
 return null;
}

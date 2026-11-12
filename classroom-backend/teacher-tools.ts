import type {D1Database} from '@cloudflare/workers-types';
import {ensureMeetings} from './meeting-series';
import {deleteCampusAttendanceForStudent} from './campus-attendance';
import {clearTransferredHomework,hasTransferredHomework} from './transferred-homework';
import {lessonRewardKey,lessonRates,rewardProgram} from './reward-program';
import {lessonHomeworkStatuses,lessonParticipation,type LessonReward} from '../lib/reward-program';
import {chinaDay,validDay,addDays} from '../lib/teacher-dashboard';
// Called only after the existing teacher authorization check.
export async function teacherTools(db:D1Database,path:string,method:string,data:Record<string,unknown>,url:URL){
 const check=(ok:unknown,message:string)=>{if(!ok)throw Object.assign(new Error(message),{status:400})};
 const str=(x:unknown)=>typeof x==='string'?x.trim():'';
 if(path==='/calendar'&&method==='GET'){
 const from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'';
 check(validDay(from)&&validDay(to)&&to>=from&&to<=addDays(from,62),'Choose a date range of at most 63 days.');
 await ensureMeetings(db,from,to);
 const meetings=await db.prepare(`SELECT m.*,COALESCE(gc.campus_id,'main') AS campus_id,f.value AS rate_value FROM class_meetings m
  LEFT JOIN group_campuses gc ON gc.group_id=m.group_id LEFT JOIN config f ON f.key=('reward_meeting_rate:' || m.id) WHERE m.day>=? AND m.day<=? ORDER BY m.day,m.time`).bind(from,to)
  .all<{id:string;day:string;campus_id:string;rate_value:string|null}>();
 const programs=new Map(await Promise.all([...new Set(meetings.results.map(m=>m.campus_id))].map(async id=>[id,await rewardProgram(db,id)] as const)));
 const marks=await db.prepare(`SELECT a.*,c.name,q.value AS reward_value FROM attendance a JOIN children c ON c.id=a.child_id JOIN class_meetings m ON m.id=a.meeting_id LEFT JOIN config q ON q.key=('lesson_reward:' || a.child_id || ':' || m.id) WHERE m.day>=? AND m.day<=?`).bind(from,to).all<{reward_value:string|null}>();
 return {meetings:meetings.results.map(({campus_id,rate_value,...m})=>({...m,rates:rate_value?JSON.parse(rate_value):lessonRates(programs.get(campus_id)!,m)})),
  marks:marks.results.map(({reward_value,...m})=>reward_value?{...m,reward:JSON.parse(reward_value)}:m)};
 }
 if(path==='/schedule'&&method==='POST'){
 const groupId=str(data.groupId),day=str(data.day),time=str(data.time),duration=Number(data.duration),weeks=Number(data.weeks),eventId=str(data.eventId);
 check(await db.prepare('SELECT id FROM groups WHERE id=?').bind(groupId).first(),'Choose a class.');
 check(validDay(day)&&day>='2020-01-01'&&day<='2100-12-31','Choose a valid date.');
 check(/^([01]\d|2[0-3]):[0-5]\d$/.test(time),'Choose a start time.');
 check(Number.isInteger(duration)&&duration>=5&&duration<=480,'Duration must be 5–480 minutes.');
 check(data.repeatForever===true||(Number.isInteger(weeks)&&weeks>=1&&weeks<=16),'Repeat for 1–16 weeks.');
 check(/^[a-zA-Z0-9-]{16,80}$/.test(eventId),'Missing schedule identifier.');
 const end=data.repeatForever===true?null:addDays(day,(weeks-1)*7);
 // Idempotent retry: an existing rule is never silently changed.
 const existing=await db.prepare('SELECT * FROM meeting_series WHERE id=?').bind(eventId).first<{group_id:string;start_day:string;end_day:string|null;time:string;duration:number}>();
 check(!existing||(existing.group_id===groupId&&existing.start_day===day&&existing.end_day===end&&existing.time===time&&Number(existing.duration)===duration),'This schedule identifier is already in use.');
 await db.prepare('INSERT OR IGNORE INTO meeting_series(id,group_id,start_day,end_day,time,duration) VALUES(?,?,?,?,?,?)').bind(eventId,groupId,day,end,time,duration).run();
 await ensureMeetings(db,day,end||addDays(day,56),groupId);return {saved:true};
 }
 if(path==='/update-meeting'&&method==='POST'){
 const id=str(data.id),time=str(data.time);
 check(/^([01]\d|2[0-3]):[0-5]\d$/.test(time),'Choose a valid 24-hour time (HH:MM).');
 check(await db.prepare('SELECT id FROM class_meetings WHERE id=?').bind(id).first(),'This class session could not be found.');
 // Keep the session identity, attendance snapshot and other weekly sessions intact.
 await db.prepare('UPDATE class_meetings SET time=? WHERE id=?').bind(time,id).run();
 return {saved:true};
 }
 if(path==='/attendance'&&method==='POST'){
 const id=str(data.meetingId);
 const entries=Array.isArray(data.marks)?data.marks:[{childId:data.childId,status:data.status}];
 check(entries.length>0&&entries.length<=500,'Choose 1–500 attendance records.');
 const roster=await db.prepare('SELECT c.id FROM children c JOIN class_meetings m ON m.id=? WHERE ((c.group_id=m.group_id AND c.approved=1) OR EXISTS(SELECT 1 FROM attendance a WHERE a.meeting_id=m.id AND a.child_id=c.id))').bind(id).all<{id:string}>();
 const allowed=new Set(roster.results.map(c=>c.id)),seen=new Set<string>(),statements=[];
 const attendance:unknown[][]=[],awards:unknown[][]=[];
 for(const entry of entries){
 check(entry&&typeof entry==='object','Choose an attendance record.');
 const row=entry as Record<string,unknown>,childId=str(row.childId),status=str(row.status);
 check(['present','absent','late','excused','unmarked'].includes(status),'Choose an attendance status.');
 check(allowed.has(childId),'This student is not in this class.');
 check(!seen.has(childId),'A student can only appear once.');seen.add(childId);
 if(row.reward!==undefined){
  const reward=row.reward as LessonReward;
  check(reward&&lessonHomeworkStatuses.includes(reward.homework)&&lessonParticipation.includes(reward.participation)
   &&Number.isSafeInteger(reward.extra)&&Math.abs(reward.extra)<=1000&&typeof reward.note==='string'&&reward.note.length<=240,'Check the lesson points and note.');
  awards.push([lessonRewardKey(childId,id),JSON.stringify({homework:reward.homework,extra:reward.extra,note:reward.note,
   participation:status==='present'||status==='late'?reward.participation:'none'})]);
 }
 attendance.push([id,childId,status]);
 }
 const meeting=await db.prepare(`SELECT m.id,m.day,COALESCE(gc.campus_id,'main') AS campus_id FROM class_meetings m
  LEFT JOIN group_campuses gc ON gc.group_id=m.group_id WHERE m.id=?`).bind(id).first<{id:string;day:string;campus_id:string}>();
 if(meeting&&meeting.day<=chinaDay()){
  const rate=lessonRates(await rewardProgram(db,meeting.campus_id),meeting);
  statements.push(db.prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO NOTHING')
   .bind('reward_meeting_rate:'+id,JSON.stringify(rate)));
 }
 for(let i=0;i<attendance.length;i+=30){
  const batch=attendance.slice(i,i+30);
  statements.push(db.prepare(`INSERT INTO attendance(meeting_id,child_id,status) VALUES ${batch.map(()=>'(?,?,?)').join(',')}
   ON CONFLICT(meeting_id,child_id) DO UPDATE SET status=excluded.status`).bind(...batch.flat()));
 }
 for(let i=0;i<awards.length;i+=40){
  const batch=awards.slice(i,i+40);
  statements.push(db.prepare(`INSERT INTO config(key,value) VALUES ${batch.map(()=>'(?,?)').join(',')}
   ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(...batch.flat()));
 }
 await db.batch(statements);return {saved:true,count:entries.length};
 }
 if(path==='/delete-meeting'&&method==='POST'){
 const id=str(data.id),row=await db.prepare('SELECT * FROM class_meetings WHERE id=?').bind(id).first<{day:string;group_id:string}>();
 check(row,'This class session could not be found.');
 check(data.scope===undefined||data.scope==='one'||data.scope==='following','Choose which sessions to delete.');
 const seriesId=id.replace(/-\d+$/,'');
 const series=await db.prepare('SELECT id FROM meeting_series WHERE id=? AND group_id=?').bind(seriesId,row!.group_id).first();
 const following=data.scope==='following',statements=[];
 if(series){
 if(following)statements.push(db.prepare('UPDATE meeting_series SET end_day=? WHERE id=? AND (end_day IS NULL OR end_day>?)').bind(addDays(row!.day,-1),seriesId,addDays(row!.day,-1)));
 else statements.push(db.prepare('INSERT OR IGNORE INTO meeting_exceptions(series_id,day) VALUES(?,?)').bind(seriesId,row!.day));
 }
 // Legacy finite schedules already use eventId-weekIndex; keep their earlier dates intact too.
 const where=following&&seriesId!==id?'group_id=? AND id LIKE ? AND day>=?':'id=?';
 const params=following&&seriesId!==id?[row!.group_id,seriesId+'-%',row!.day]:[id];
 statements.push(db.prepare(`DELETE FROM config WHERE key IN (SELECT 'reward_meeting_rate:' || id FROM class_meetings WHERE ${where})`).bind(...params));
 statements.push(db.prepare(`DELETE FROM config WHERE key>='lesson_reward:' AND key<'lesson_reward;' AND EXISTS(
  SELECT 1 FROM (SELECT id FROM class_meetings WHERE ${where}) m WHERE substr(config.key,length(config.key)-length(m.id))=(':' || m.id))`).bind(...params));
 statements.push(db.prepare('DELETE FROM attendance WHERE meeting_id IN (SELECT id FROM class_meetings WHERE '+where+')').bind(...params),db.prepare('DELETE FROM class_meetings WHERE '+where).bind(...params));
 await db.batch(statements);return {saved:true};
 }
 if(path==='/rename-group'&&method==='POST'){
 const name=str(data.name);check(name&&name.length<=80,'Enter a class name up to 80 characters.');await db.prepare('UPDATE groups SET name=? WHERE id=?').bind(name,str(data.id)).run();return {saved:true};
 }
 if(path==='/delete-student'&&method==='POST'){
 const id=str(data.id);check(data.confirm===true,'Confirm student deletion.');
 // All private QR access and dependent records are removed in one transaction.
 const statements=[db.prepare('DELETE FROM student_sessions WHERE child_id=?').bind(id),deleteCampusAttendanceForStudent(db,id),clearTransferredHomework(db,id),db.prepare('DELETE FROM config WHERE key>=? AND key<? OR key=?').bind('lesson_reward:'+id+':','lesson_reward:'+id+';','diamond_challenge:'+id)];
 for(const table of ['student_links','student_claims','attendance','reward_events','reviews','attempts','completions'])statements.push(db.prepare('DELETE FROM '+table+' WHERE child_id=?').bind(id));
 statements.push(db.prepare('DELETE FROM children WHERE id=?').bind(id));await db.batch(statements);return {saved:true};
 }
 if(path==='/delete-group'&&method==='POST'){
 const id=str(data.id);check(data.confirm===true,'Confirm class deletion.');check(!await db.prepare('SELECT id FROM children WHERE group_id=? LIMIT 1').bind(id).first(),'Move or delete the students before deleting this class.');
 check(!await hasTransferredHomework(db,'a.group_id=?',id),'Keep this class to preserve homework for students who transferred.');
 check(!await db.prepare("SELECT a.child_id FROM attendance a JOIN class_meetings m ON m.id=a.meeting_id WHERE m.group_id=? AND a.status<>'unmarked' LIMIT 1").bind(id).first(),'Keep this class to preserve attendance and XP for students who transferred.');
 await db.batch([
 db.prepare('DELETE FROM attendance WHERE meeting_id IN (SELECT id FROM class_meetings WHERE group_id=?)').bind(id),db.prepare('DELETE FROM class_meetings WHERE group_id=?').bind(id),
 db.prepare('DELETE FROM attempts WHERE assignment_id IN (SELECT id FROM assignments WHERE group_id=?)').bind(id),db.prepare('DELETE FROM completions WHERE assignment_id IN (SELECT id FROM assignments WHERE group_id=?)').bind(id),db.prepare('DELETE FROM assignments WHERE group_id=?').bind(id),db.prepare('DELETE FROM groups WHERE id=?').bind(id)]);return {saved:true};
 }
 return null;
}

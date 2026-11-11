import type {D1Database} from '@cloudflare/workers-types';
import {campusAttendanceStatuses,campusClassNameLimit,campusLessonsLimit,isHtCampus,type CampusAttendanceMark} from '../lib/campus-attendance';
import type {StaffAccess} from '../lib/staff';
import {chinaDay,validDay} from '../lib/teacher-dashboard';
import {StaffError} from './staff';

// Day logs are stored separately from the scheduled attendance records.
const namespace='campus_attendance:';
export const deleteCampusAttendanceForStudent=(db:D1Database,id:string)=>
 db.prepare("DELETE FROM config WHERE key>=? AND key<? AND substr(key,length(key)-length(?)+1)=?").bind(namespace,'campus_attendance;',':'+id,':'+id);
export const deleteCampusAttendanceForCampus=(db:D1Database,id:string)=>
 db.prepare('DELETE FROM config WHERE key>=? AND key<?').bind(namespace+id+':',namespace+id+';');

export async function campusAttendance(db:D1Database,access:StaffAccess,url:URL,method:string,data:Record<string,unknown>,now:number){
 const campusId=url.searchParams.get('campus')||'';
 if(!access.owner&&campusId!==access.campusId)throw new StaffError('You do not have access to this campus.');
 const campus=await db.prepare('SELECT name FROM campuses WHERE id=?').bind(campusId).first<{name:string}>();
 if(!campus||!isHtCampus(campus.name))throw new StaffError('Daily attendance is available at HT campus.',404);
 const day=url.searchParams.get('day')||'';
 if(!validDay(day)||day<'2020-01-01'||day>chinaDay(now))throw new StaffError('Choose today or an earlier date.',400);
 if(method!=='GET'&&method!=='POST')throw new StaffError('Method not allowed.',405);
 if(method==='POST'&&!access.owner&&!access.permissions.includes('attendance'))throw new StaffError('You do not have permission to mark attendance.');
 const classPrefix=namespace+campusId+':classes';
 const listClasses=async()=>(await db.prepare('SELECT value FROM config WHERE key>=? AND key<? ORDER BY key')
  .bind(classPrefix+':',classPrefix+';').all<{value:string}>()).results.map(row=>row.value);
 if(method==='POST'&&(data.action==='add-class'||data.action==='remove-class')){
  const name=typeof data.name==='string'?data.name.trim():'';
  if(!name||name.length>campusClassNameLimit||/[,，\u0000-\u001f]/.test(name)){
   throw new StaffError('Enter one class name without commas (up to 60 characters).',400);
  }
  // The trailing colon keeps catalog entries separate from student-record cleanup.
  const key=classPrefix+':'+name.toLowerCase()+':';
  if(data.action==='add-class'){
   await db.prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO NOTHING').bind(key,name).run();
  }else{
   await db.prepare('DELETE FROM config WHERE key=?').bind(key).run();
  }
  return {classes:await listClasses()};
 }
 const prefix=namespace+campusId+':'+day+':';
 const roster=await db.prepare(`SELECT c.id,c.name,c.approved,c.group_id,g.name AS group_name,r.value
  FROM children c JOIN groups g ON g.id=c.group_id
  LEFT JOIN group_campuses gc ON gc.group_id=g.id
  LEFT JOIN config r ON r.key=(? || c.id)
  WHERE (COALESCE(gc.campus_id,'main')=? AND c.approved=1) OR r.key IS NOT NULL
  ORDER BY c.name,c.id`).bind(prefix,campusId).all<{id:string;name:string;approved:number;group_id:string;group_name:string;value:string|null}>();
 const visible=roster.results.filter(row=>access.owner||access.groups.includes(row.group_id));
 if(method==='GET')return {day,classes:await listClasses(),students:visible.map(row=>{
  const mark=row.value?JSON.parse(row.value) as Omit<CampusAttendanceMark,'childId'>:null;
  return {childId:row.id,name:row.name,groupName:row.group_name,status:mark?.status??'unmarked',lessons:mark?.lessons??''};
 })};

 const marks=data.marks;
 if(!Array.isArray(marks)||!marks.length||marks.length>500)throw new StaffError('Choose 1–500 attendance records.',400);
 const allowed=new Set(visible.map(row=>row.id));
 const saved=new Map<string,string|null>();
 for(const mark of marks){
  if(!mark||typeof mark!=='object'||typeof mark.childId!=='string'||!campusAttendanceStatuses.includes(mark.status)||
   typeof mark.lessons!=='string'||mark.lessons.trim().length>campusLessonsLimit||saved.has(mark.childId)){
   throw new StaffError('Check the attendance status and class names for each student.',400);
  }
  if(!allowed.has(mark.childId))throw new StaffError('A student is outside your HT campus roster.');
  const lessons=mark.lessons.trim();
  saved.set(mark.childId,mark.status==='unmarked'&&!lessons?null:JSON.stringify({status:mark.status,lessons}));
 }
 const updates=[...saved].filter((entry):entry is [string,string]=>entry[1]!==null);
 const clears=[...saved].filter(([,value])=>value===null).map(([id])=>prefix+id);
 const statements=[];
 for(let i=0;i<updates.length;i+=40){
  const batch=updates.slice(i,i+40);
  statements.push(db.prepare(`INSERT INTO config(key,value) VALUES ${batch.map(()=>'(?,?)').join(',')}
   ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(...batch.flatMap(([id,value])=>[prefix+id,value])));
 }
 for(let i=0;i<clears.length;i+=80){
  const batch=clears.slice(i,i+80);
  statements.push(db.prepare('DELETE FROM config WHERE key IN ('+batch.map(()=>'?').join(',')+')').bind(...batch));
 }
 await db.batch(statements);
 return {saved:true,count:saved.size};
}

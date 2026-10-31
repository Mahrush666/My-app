import type {D1Database} from '@cloudflare/workers-types';
import {staffPermissions,type StaffAccess,type StaffPermission} from '../lib/staff';
export class StaffError extends Error{constructor(message:string,public status=403){super(message)}}
export async function staffAccess(db:D1Database,id:string|null):Promise<StaffAccess>{
 if(!id)return {owner:true,name:'Owner',permissions:staffPermissions.map(p=>p[0]),groups:[]};
 const row=await db.prepare('SELECT name,permissions,groups_json,active FROM staff_accounts WHERE id=?').bind(id).first<{name:string;permissions:string;groups_json:string;active:number}>();
 if(!row?.active)throw new StaffError('Your teacher access has been suspended. Contact the owner.');
 const campus=await db.prepare('SELECT campus_id FROM staff_campuses WHERE staff_id=?').bind(id).first<{campus_id:string}>();const campusId=campus?.campus_id||'main';
 const classes=await db.prepare("SELECT g.id FROM groups g LEFT JOIN group_campuses gc ON gc.group_id=g.id WHERE COALESCE(gc.campus_id,'main')=?").bind(campusId).all<{id:string}>();
 const allowed=new Set(classes.results.map(g=>g.id));
 return {owner:false,name:row.name,campusId,permissions:JSON.parse(row.permissions),groups:(JSON.parse(row.groups_json) as string[]).filter(id=>allowed.has(id))};
}
export async function authorizeStaff(db:D1Database,access:StaffAccess,path:string,data:Record<string,unknown>,url:URL){
 if(access.owner)return;
 const deny=()=>{throw new StaffError('You do not have permission for this action or class.');};
 const need=(p:StaffPermission)=>{if(!access.permissions.includes(p))deny()};
 const group=(id:unknown)=>{if(typeof id!=='string'||!access.groups.includes(id))deny()};
 const child=async(id:unknown)=>{const row=await db.prepare('SELECT group_id FROM children WHERE id=?').bind(typeof id==='string'?id:'').first<{group_id:string}>();group(row?.group_id)};
 if(path==='/teacher'||path==='/calendar')return;
 if(path==='/daily-practice-report'||path==='/weekly-homework-report'){group(url.searchParams.get('group'));return;}
 if(path==='/homework-report'){await child(url.searchParams.get('child'));const row=await db.prepare('SELECT group_id FROM assignments WHERE id=?').bind(url.searchParams.get('assignment')||'').first<{group_id:string}>();group(row?.group_id);return;}
 if(path==='/rewards'){await child(url.searchParams.get('child'));return;}
 if(path==='/groups'){need('classes');if(data.campusId!==undefined&&data.campusId!==access.campusId)deny();return;}
 if(path.startsWith('/staff')||path==='/delete-group')deny();
 if(['/teacher-students','/move-student','/approve','/invite','/student-link','/student-invite','/rename-group'].includes(path))need('students');
 else if(path==='/attendance')need('attendance');
 else if(path==='/schedule'||path==='/update-meeting'||path==='/delete-meeting')need('schedule');
 else if(path==='/lesson-settings')need('materials');
 else if(path==='/assignments')need('assignments');
 else if(path==='/delete-assignment'){need('delete');need('assignments');}
 else if(path==='/delete-student'){need('delete');need('students');}
 else if(path==='/reward-award'||path==='/reward-undo')need('rewards');
 else deny();
 if(data.groupId!==undefined)group(data.groupId);
 if(data.childId!==undefined)await child(data.childId);
 if(path==='/delete-student')await child(data.id);
 if(path==='/rename-group')group(data.id);
 if(path==='/delete-assignment'||path==='/assignments'&&data.id){const row=await db.prepare('SELECT group_id FROM assignments WHERE id=?').bind(String(data.id||'')).first<{group_id:string}>();group(row?.group_id)}
 if(path==='/attendance'||path==='/update-meeting'||path==='/delete-meeting'){const row=await db.prepare('SELECT group_id FROM class_meetings WHERE id=?').bind(String(path==='/attendance'?data.meetingId:data.id)).first<{group_id:string}>();group(row?.group_id)}
 if(path==='/attendance'&&Array.isArray(data.marks)){
 const ids=[...new Set(data.marks.map(m=>m&&typeof m==='object'?String((m as Record<string,unknown>).childId||''):''))];
 if(!ids.length||ids.length>500||ids.includes(''))deny();
 const students=await db.prepare('SELECT id,group_id FROM children WHERE id IN ('+ids.map(()=>'?').join(',')+')').bind(...ids).all<{id:string;group_id:string}>();
 if(students.results.length!==ids.length)deny();for(const row of students.results)group(row.group_id);
 }
 // Staff cannot use roster creation to attach children to an arbitrary parent's account.
 if(path==='/teacher-students'&&data.parentUsername)deny();
 // A replay identifier may never target a session belonging to another class.
 if(path==='/schedule'){const rows=await db.prepare('SELECT group_id FROM class_meetings WHERE id LIKE ?').bind(String(data.eventId)+'-%').all<{group_id:string}>();for(const row of rows.results)group(row.group_id)}
}
export function filterCalendar(result:any,access:StaffAccess){if(access.owner)return result;const meetings=result.meetings.filter((m:any)=>access.groups.includes(m.group_id));return {...result,meetings,marks:result.marks.filter((m:any)=>meetings.some((s:any)=>s.id===m.meeting_id))}}

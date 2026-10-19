import {studentDashboard} from './student-dashboard';
import {staffAccess,authorizeStaff,filterCalendar,StaffError} from './staff';
import {staffPermissions} from '../lib/staff';
import {teacherTools} from './teacher-tools';
import {readRewards,syncHomeworkRewards} from './rewards';
import {rewardBadges} from '../lib/rewards';
import {checkStoryAnswer} from '../lib/illustrated-reading';
import {requiresAnswers} from '../lib/homework-completion';
import {supportsActivity} from '../lib/activity-availability';
import type {D1Database} from '@cloudflare/workers-types';
import {lessons} from '../github-pages/lessons';
import {activityOptions,type ActivityId} from '../lib/unit-activities';
export type Env={DB:D1Database;ALLOWED_ORIGINS:string;TEACHER_PASSWORD?:string;TEACHER_PASSWORD_HASH?:string};
const ROSTER_ID='teacher-managed-roster';
const ROSTER_USERNAME='__teacher_roster__';
const enc=new TextEncoder();
const hex=(v:ArrayBuffer|Uint8Array)=>Array.from(new Uint8Array(v),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const hash=async(s:string)=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256))}
async function equal(a:string,b:string){const key=await crypto.subtle.importKey('raw',enc.encode('wordquest-comparison'),{name:'HMAC',hash:'SHA-256'},false,['sign']);const [x,y]=await Promise.all([crypto.subtle.sign('HMAC',key,enc.encode(a)),crypto.subtle.sign('HMAC',key,enc.encode(b))]);const aa=new Uint8Array(x),bb=new Uint8Array(y);let diff=0;for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];return diff===0}
class Failure extends Error{constructor(message:string,public status=400){super(message)}}
const requireValue=(value:unknown,message:string)=>{if(!value)throw new Failure(message)};
function text(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}
function available(unit:typeof lessons[number]){return activityOptions.map(a=>a[0]).filter(a=>supportsActivity(a,unit))}
export async function handle(request:Request,env:Env){
 const origin=request.headers.get('Origin');const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim());
 const headers:Record<string,string>={'Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 const respond=(value:unknown,status=200)=>Response.json(value,{status,headers});
 if(origin&&!allowed.includes(origin))return respond({error:'This app address is not allowed.'},403);
 if(origin){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='Content-Type, Authorization, apikey, X-Wordquest-Session';headers['Access-Control-Allow-Methods']='GET, POST, DELETE, OPTIONS'}
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 const path=new URL(request.url).pathname;
 try{
 if(path==='/health'&&request.method==='GET'){if(!env.DB||(!env.TEACHER_PASSWORD&&!env.TEACHER_PASSWORD_HASH))return respond({status:'not_configured'},503);await env.DB.prepare('SELECT id FROM groups LIMIT 1').first();return respond({status:'ready'})}
 if(!env.DB||(!env.TEACHER_PASSWORD&&!env.TEACHER_PASSWORD_HASH))throw new Failure('The teacher needs to finish connecting this classroom.',503);
 let data:Record<string,unknown>={};
 if(request.method==='POST'){
 if(!origin)throw new Failure('Open this through the classroom app.',403);
 const body=await request.text();if(body.length>30000)throw new Failure('This request is too large.',413);
 try{data=JSON.parse(body)}catch{throw new Failure('Invalid request.')}
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Failure('Invalid request.');
 }
 const now=Date.now();
 if(['/register','/login','/teacher-login'].includes(path)&&request.method==='POST'){
 // Bound both account and IP attempts without logging credentials.
 const username=text(data.username,40).toLowerCase();const ip=request.headers.get('CF-Connecting-IP')||'local';
 for(const [scope,max] of [['ip:'+ip,100],['account:'+(path==='/teacher-login'?'teacher:'+username:username),10]] as const){
 const key=await hash(scope+':'+Math.floor(now/900000));
 const limit=await env.DB.prepare('INSERT INTO login_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+900000).first<{count:number}>();
 if((limit?.count||0)>max)throw new Failure('Too many attempts. Try again in 15 minutes.',429);
 }
 await env.DB.batch([env.DB.prepare('DELETE FROM student_sessions WHERE session_hash IN (SELECT hash FROM sessions WHERE expires<?)').bind(now),env.DB.prepare('DELETE FROM login_limits WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(now)]);
 const password=typeof data.password==='string'?data.password:'';if(password.length>128)throw new Failure('Password is too long.');
 let accountId:string|null=null;let role='parent';
 if(path==='/teacher-login'){
 if(username){const staff=await env.DB.prepare('SELECT id,salt,password_hash,active FROM staff_accounts WHERE username=?').bind(username).first<{id:string;salt:string;password_hash:string;active:number}>();const actual=await passwordHash(password,staff?.salt||'missing-staff');if(!staff?.active||!staff.password_hash||!await equal(actual,staff.password_hash))throw new Failure('Incorrect teacher login or inactive account.',401);accountId=staff.id;}
 else if(!await equal(env.TEACHER_PASSWORD_HASH?await hash(password):password,env.TEACHER_PASSWORD_HASH||env.TEACHER_PASSWORD||''))throw new Failure('Incorrect teacher password.',401);role='teacher'}
 else{
 requireValue(username!==ROSTER_USERNAME&&/^[a-z0-9_-]{3,40}$/.test(username),'Use a login name with 3–40 letters, numbers, underscores or hyphens.');
 const account=await env.DB.prepare('SELECT * FROM accounts WHERE username=?').bind(username).first<{id:string;salt:string;password_hash:string}>();
 if(path==='/register'){
 requireValue(password.length>=10,'Choose a password of at least 10 characters.');requireValue(data.consent===true,'An adult must agree to create a family account.');
 if(account)throw new Failure('That login name is taken. Choose another.');
 accountId=crypto.randomUUID();const salt=random();await env.DB.prepare('INSERT INTO accounts VALUES(?,?,?,?,?)').bind(accountId,username,salt,await passwordHash(password,salt),now).run();
 }else{const actual=await passwordHash(password,account?.salt||'missing-account');if(!account||!await equal(actual,account.password_hash))throw new Failure('Incorrect login name or password.',401);accountId=account.id}
 }
 const token=random();await env.DB.prepare('INSERT INTO sessions VALUES(?,?,?,?)').bind(await hash(token),accountId,role,now+30*86400000).run();return respond({token,role});
 }
 if(path==='/staff-accept'&&request.method==='POST'){
 const invite=text(data.invite,80),password=typeof data.password==='string'?data.password:'';
 requireValue(/^[a-f0-9]{64}$/.test(invite)&&password.length>=10&&password.length<=128,'Use a valid teacher invitation and a password of 10–128 characters.');
 const salt=random(),verifier=await passwordHash(password,salt);
 const result=await env.DB.prepare('UPDATE staff_accounts SET salt=?,password_hash=?,invite_hash=NULL,invite_expires=0 WHERE invite_hash=? AND invite_expires>? AND active=1 RETURNING username').bind(salt,verifier,await hash(invite),now).first<{username:string}>();
 requireValue(result,'This invitation has expired or was used. Ask the owner for a new one.');return respond({username:result!.username});
 }
 if(path==='/student-login'&&request.method==='POST'){
 const access=text(data.access,80);if(!/^[a-f0-9]{64}$/.test(access))throw new Failure('This homework QR is invalid.',401);
 const accessHash=await hash(access);const child=await env.DB.prepare('SELECT child_id FROM student_links WHERE access_hash=?').bind(accessHash).first<{child_id:string}>();if(!child)throw new Failure('This homework QR was replaced or disabled. Ask your teacher for a new QR.',401);
 const token=random(),sessionHash=await hash(token);await env.DB.batch([env.DB.prepare('INSERT INTO sessions VALUES(?,NULL,?,?)').bind(sessionHash,'student',now+30*86400000),env.DB.prepare('INSERT INTO student_sessions VALUES(?,?,?)').bind(sessionHash,child.child_id,accessHash)]);return respond({token,role:'student'});
 }
 const raw=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
 const session=/^[a-f0-9]{64}$/.test(raw)?await env.DB.prepare('SELECT account_id,role FROM sessions WHERE hash=? AND expires>?').bind(await hash(raw),now).first<{account_id:string;role:string}>():null;
 if(!session)throw new Failure('Please sign in.',401);
 let scopedChild:string|null=null;
 if(session.role==='student'){const access=await env.DB.prepare('SELECT ss.child_id FROM student_sessions ss JOIN student_links sl ON sl.child_id=ss.child_id AND sl.access_hash=ss.access_hash WHERE ss.session_hash=?').bind(await hash(raw)).first<{child_id:string}>();if(!access)throw new Failure('This homework QR was replaced or disabled. Ask your teacher for a new QR.',401);scopedChild=access.child_id;}
 if(path==='/logout'&&request.method==='POST'){await env.DB.batch([env.DB.prepare('DELETE FROM student_sessions WHERE session_hash=?').bind(await hash(raw)),env.DB.prepare('DELETE FROM sessions WHERE hash=?').bind(await hash(raw))]);return respond({saved:true})}
 const access=session.role==='teacher'?await staffAccess(env.DB,session.account_id):null;
 if(['/campuses','/move-class-campus','/delete-campus'].includes(path)){
 if(!access?.owner)throw new Failure('Only the owner can manage campuses.',403);
 if(path==='/campuses'&&request.method==='POST'){const name=text(data.name,80);requireValue(name,'Enter a campus name.');const id=text(data.id,80)||crypto.randomUUID();if(data.id)requireValue(await env.DB.prepare('SELECT id FROM campuses WHERE id=?').bind(id).first(),'Campus not found.');await env.DB.prepare('INSERT INTO campuses(id,name) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name').bind(id,name).run();return respond({id});}
 if(path==='/delete-campus'&&request.method==='POST'){const id=text(data.id,80);requireValue(data.confirm===true,'Confirm campus deletion.');requireValue(id!=='main','The default campus cannot be deleted. You can rename it.');requireValue(await env.DB.prepare('SELECT id FROM campuses WHERE id=?').bind(id).first(),'Campus not found.');requireValue(!await env.DB.prepare("SELECT g.id FROM groups g LEFT JOIN group_campuses gc ON gc.group_id=g.id WHERE COALESCE(gc.campus_id,'main')=?").bind(id).first(),'Move all classes and students out of this campus first.');requireValue(!await env.DB.prepare("SELECT s.id FROM staff_accounts s LEFT JOIN staff_campuses sc ON sc.staff_id=s.id WHERE COALESCE(sc.campus_id,'main')=?").bind(id).first(),'Move all teachers, including inactive teachers, out of this campus first.');await env.DB.prepare('DELETE FROM campuses WHERE id=?').bind(id).run();return respond({deleted:true});}
 if(path==='/campuses'&&request.method==='GET')return respond({campuses:(await env.DB.prepare('SELECT id,name FROM campuses ORDER BY name').all()).results});
 if(path==='/move-class-campus'&&request.method==='POST'){const id=text(data.groupId,80),campusId=text(data.campusId,80);requireValue(await env.DB.prepare('SELECT id FROM groups WHERE id=?').bind(id).first(),'Class not found.');requireValue(await env.DB.prepare('SELECT id FROM campuses WHERE id=?').bind(campusId).first(),'Campus not found.');await env.DB.prepare('INSERT INTO group_campuses(group_id,campus_id) VALUES(?,?) ON CONFLICT(group_id) DO UPDATE SET campus_id=excluded.campus_id').bind(id,campusId).run();return respond({saved:true});}
 }
 const teacherPaths=['/teacher','/calendar','/schedule','/attendance','/delete-meeting','/rename-group','/delete-student','/delete-group','/rewards','/reward-award','/reward-undo','/groups','/invite','/teacher-students','/move-student','/student-link','/student-invite','/approve','/assignments','/delete-assignment'];
 if(access&&(teacherPaths.includes(path)||path.startsWith('/staff')))await authorizeStaff(env.DB,access,path,data,new URL(request.url));
 if(path==='/staff'&&request.method==='GET'){
 if(!access?.owner)throw new Failure('Owner access required.',403);
 const rows=await env.DB.prepare("SELECT s.id,s.name,s.username,s.role,s.permissions,s.groups_json,s.active,s.password_hash,COALESCE(sc.campus_id,'main') AS campus_id FROM staff_accounts s LEFT JOIN staff_campuses sc ON sc.staff_id=s.id ORDER BY s.created_at").all<{id:string;name:string;username:string;role:string;permissions:string;groups_json:string;active:number;password_hash:string;campus_id:string}>();
 return respond({teachers:rows.results.map(({password_hash,groups_json,permissions,campus_id,...r})=>({...r,campusId:campus_id,ready:Boolean(password_hash),permissions:JSON.parse(permissions),groups:JSON.parse(groups_json)}))});
 }
 if(path==='/staff-save'&&request.method==='POST'){
 if(!access?.owner)throw new Failure('Owner access required.',403);
 const name=text(data.name,60),username=text(data.username,40).toLowerCase(),role=text(data.role,20),id=text(data.id,80)||crypto.randomUUID();
 requireValue(name&&/^[a-z0-9_-]{3,40}$/.test(username)&&['teacher','assistant'].includes(role),'Enter a name, login name and role.');
 const permissions=Array.isArray(data.permissions)?[...new Set(data.permissions)]:[],groups=Array.isArray(data.groups)?[...new Set(data.groups)]:[];
 requireValue(permissions.every(p=>staffPermissions.some(([key])=>key===p))&&groups.length<=100,'Choose valid permissions and classes.');
 const previousCampus=data.id?await env.DB.prepare('SELECT campus_id FROM staff_campuses WHERE staff_id=?').bind(id).first<{campus_id:string}>():null;
 const campusId=text(data.campusId,80)||previousCampus?.campus_id||'main';requireValue(await env.DB.prepare('SELECT id FROM campuses WHERE id=?').bind(campusId).first(),'Choose a campus.');
 for(const group of groups)requireValue(typeof group==='string'&&await env.DB.prepare("SELECT g.id FROM groups g LEFT JOIN group_campuses gc ON gc.group_id=g.id WHERE g.id=? AND COALESCE(gc.campus_id,'main')=?").bind(group,campusId).first(),'Every assigned class must belong to this teacher’s campus.');
 if(data.id)requireValue(await env.DB.prepare('SELECT id FROM staff_accounts WHERE id=?').bind(id).first(),'Teacher not found.');
 const existing=await env.DB.prepare('SELECT id FROM staff_accounts WHERE username=?').bind(username).first<{id:string}>();requireValue(!existing||existing.id===id,'That teacher login name is already used.');
 requireValue(typeof data.active==='boolean','Choose account status.');
 await env.DB.batch([env.DB.prepare('INSERT INTO staff_accounts(id,name,username,role,permissions,groups_json,active,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,username=excluded.username,role=excluded.role,permissions=excluded.permissions,groups_json=excluded.groups_json,active=excluded.active').bind(id,name,username,role,JSON.stringify(permissions),JSON.stringify(groups),Number(data.active),now),env.DB.prepare('INSERT INTO staff_campuses(staff_id,campus_id) VALUES(?,?) ON CONFLICT(staff_id) DO UPDATE SET campus_id=excluded.campus_id').bind(id,campusId)]);
 if(!data.active)await env.DB.prepare('DELETE FROM sessions WHERE account_id=? AND role=?').bind(id,'teacher').run();
 return respond({id});
 }
 if(path==='/staff-invite'&&request.method==='POST'){
 if(!access?.owner)throw new Failure('Owner access required.',403);
 const id=text(data.id,80);requireValue(await env.DB.prepare('SELECT id FROM staff_accounts WHERE id=? AND active=1').bind(id).first(),'Choose an active teacher.');
 const invite=random();await env.DB.batch([env.DB.prepare('UPDATE staff_accounts SET invite_hash=?,invite_expires=?,password_hash=?,salt=? WHERE id=?').bind(await hash(invite),now+7*86400000,'','',id),env.DB.prepare('DELETE FROM sessions WHERE account_id=? AND role=?').bind(id,'teacher')]);
 return respond({invite});
 }
 const teacher=()=>{if(session.role!=='teacher')throw new Failure('Teacher access required.',403)};
 if(['/calendar','/schedule','/attendance','/delete-meeting','/rename-group','/delete-student','/delete-group'].includes(path)){teacher();try{const result=await teacherTools(env.DB,path,request.method,data,new URL(request.url));if(result){if(path==='/calendar'){let scope=access!;const campus=new URL(request.url).searchParams.get('campus');if(scope.owner&&campus&&campus!=='all'){const classes=await env.DB.prepare("SELECT g.id FROM groups g LEFT JOIN group_campuses gc ON gc.group_id=g.id WHERE COALESCE(gc.campus_id,'main')=?").bind(campus).all<{id:string}>();scope={...scope,owner:false,groups:classes.results.map(g=>g.id)}}const filtered=filterCalendar(result,scope);if(!scope.owner){const students=await env.DB.prepare('SELECT id,group_id FROM children').all<{id:string;group_id:string}>();const visible=new Set(students.results.filter(c=>scope.groups.includes(c.group_id)).map(c=>c.id));filtered.marks=filtered.marks.filter((m:any)=>visible.has(m.child_id))}return respond(filtered)}return respond(result)}}catch(e){if(e instanceof Error&&'status' in e)throw new Failure(e.message,Number(e.status));throw e}}
 const childAccess=async(id:unknown)=>{const c=await env.DB.prepare(scopedChild?'SELECT * FROM children WHERE id=? AND id=?':'SELECT * FROM children WHERE id=? AND parent_id=?').bind(text(id,80),scopedChild||session.account_id).first<{id:string;group_id:string;approved:number}>();if(!c)throw new Failure('Child profile not found.',404);return c};
 if(path==='/rewards'&&request.method==='GET'){
 const id=text(new URL(request.url).searchParams.get('child'),80);
 if(session.role==='teacher'){requireValue(await env.DB.prepare('SELECT id FROM children WHERE id=?').bind(id).first(),'Student not found.');}else{const child=await childAccess(id);requireValue(child.approved,'Your teacher needs to approve this profile.');}
 const rewardChild=await env.DB.prepare('SELECT group_id,approved FROM children WHERE id=?').bind(id).first<{group_id:string;approved:number}>();
 if(rewardChild?.approved){const tasks=await env.DB.prepare('SELECT id,activities,title,updated_at FROM assignments WHERE group_id=?').bind(rewardChild.group_id).all<{id:string;activities:string;title:string;updated_at:number}>();await syncHomeworkRewards(env.DB,id,tasks.results,now);}
 return respond(await readRewards(env.DB,id));
 }
 if(path==='/reward-award'&&request.method==='POST'){
 teacher();const childId=text(data.childId,80);requireValue(await env.DB.prepare('SELECT id FROM children WHERE id=?').bind(childId).first(),'Student not found.');
 const kind=text(data.kind,20),eventId=text(data.eventId,80);requireValue(/^[a-zA-Z0-9-]{16,80}$/.test(eventId),'An award identifier is required.');
 let xp=0,label=text(data.reason,200),source='manual:'+eventId;
 if(kind==='badge'){const badge=rewardBadges.find(b=>b.id===data.badgeId);requireValue(badge,'Choose a badge.');xp=badge!.xp;label=badge!.name;source='badge:'+badge!.id;}
 else if(kind==='diamond'){source='diamond';requireValue(label,'Describe the outstanding work.');}
 else if(kind==='manual'){xp=Number(data.xp);requireValue(Number.isInteger(xp)&&xp!==0&&xp>=-100&&xp<=100,'Use whole points from -100 to 100, excluding zero.');requireValue(label,'Enter the reason for this award.');}
 else throw new Failure('Choose a valid reward.');
 await env.DB.prepare(`INSERT INTO reward_events(id,child_id,source,kind,label,xp,created_at,revoked) VALUES(?,?,?,?,?,?,?,0) ON CONFLICT(child_id,source) DO UPDATE SET label=excluded.label,xp=excluded.xp,created_at=excluded.created_at,revoked=0 WHERE reward_events.revoked=1 AND reward_events.kind IN ('badge','diamond')`).bind(crypto.randomUUID(),childId,source,kind,label,xp,now).run();
 return respond(await readRewards(env.DB,childId));
 }
 if(path==='/reward-undo'&&request.method==='POST'){
 teacher();const childId=text(data.childId,80),id=text(data.id,80);const entry=await env.DB.prepare('SELECT kind FROM reward_events WHERE id=? AND child_id=?').bind(id,childId).first<{kind:string}>();requireValue(entry&&entry.kind!=='homework','Only teacher awards can be undone.');await env.DB.prepare('UPDATE reward_events SET revoked=1 WHERE id=? AND child_id=?').bind(id,childId).run();return respond(await readRewards(env.DB,childId));
 }
 if(path==='/teacher'&&request.method==='GET'){
 teacher();const [groups,children,assignments,reports]=await Promise.all([
 env.DB.prepare("SELECT g.id,g.name,COALESCE(gc.campus_id,'main') AS campus_id FROM groups g LEFT JOIN group_campuses gc ON gc.group_id=g.id ORDER BY g.created_at").all(),env.DB.prepare("SELECT c.*,CASE WHEN a.id='teacher-managed-roster' THEN NULL ELSE a.username END AS username FROM children c JOIN accounts a ON a.id=c.parent_id ORDER BY c.created_at").all(),env.DB.prepare('SELECT * FROM assignments ORDER BY updated_at DESC').all(),
 env.DB.prepare('SELECT c.id AS child_id,a.id AS assignment_id,a.title,(SELECT COUNT(*) FROM attempts t WHERE t.child_id=c.id AND t.assignment_id=a.id) AS attempts,(SELECT COUNT(*) FROM attempts t WHERE t.child_id=c.id AND t.assignment_id=a.id AND t.correct=1) AS correct,(SELECT MAX(created_at) FROM attempts t WHERE t.child_id=c.id AND t.assignment_id=a.id) AS last_seen,(SELECT json_group_array(activity) FROM completions x WHERE x.child_id=c.id AND x.assignment_id=a.id) AS completed FROM children c JOIN assignments a ON a.group_id=c.group_id WHERE c.approved=1').all()]);
 const selectedCampus=new URL(request.url).searchParams.get('campus');const campuses=access!.owner?(await env.DB.prepare('SELECT id,name FROM campuses ORDER BY name').all()).results:(await env.DB.prepare('SELECT id,name FROM campuses WHERE id=?').bind(access!.campusId!).all()).results;const visibleGroups=groups.results.filter((g:any)=>access!.owner?(!selectedCampus||selectedCampus==='all'||g.campus_id===selectedCampus):access!.groups.includes(g.id));const ids=visibleGroups.map((g:any)=>g.id);const visibleChildren=children.results.filter((c:any)=>ids.includes(c.group_id));const childIds=visibleChildren.map((c:any)=>c.id);const visibleAssignments=assignments.results.filter((a:any)=>ids.includes(a.group_id));const assignmentIds=visibleAssignments.map((a:any)=>a.id);
 return respond({access,campuses,...(access!.owner?{allGroups:groups.results}:{}),groups:visibleGroups,children:visibleChildren,assignments:visibleAssignments,reports:reports.results.filter((r:any)=>childIds.includes(r.child_id)&&assignmentIds.includes(r.assignment_id))});
 }
 if(path==='/groups'&&request.method==='POST'){
 teacher();const name=text(data.name,80);requireValue(name,'Enter a class name.');const campusId=text(data.campusId,80)||'main';requireValue(await env.DB.prepare('SELECT id FROM campuses WHERE id=?').bind(campusId).first(),'Choose a campus.');const invite=random(),id=crypto.randomUUID();await env.DB.batch([env.DB.prepare('INSERT INTO groups VALUES(?,?,?,?)').bind(id,name,await hash(invite),now),env.DB.prepare('INSERT INTO group_campuses(group_id,campus_id) VALUES(?,?)').bind(id,campusId)]);return respond({id,invite});
 }
 if(path==='/invite'&&request.method==='POST'){teacher();const id=text(data.groupId,80);requireValue(await env.DB.prepare('SELECT id FROM groups WHERE id=?').bind(id).first(),'Choose a class.');const invite=random();await env.DB.prepare('UPDATE groups SET invite_hash=? WHERE id=?').bind(await hash(invite),id).run();return respond({invite})}
 if(path==='/teacher-students'&&request.method==='POST'){
 teacher();const groupId=text(data.groupId,80);requireValue(await env.DB.prepare('SELECT id FROM groups WHERE id=?').bind(groupId).first(),'Choose a class.');
 requireValue(Array.isArray(data.names)&&data.names.length>0&&data.names.length<=20,'Add 1–20 student names, one per line.');
 const names=(data.names as unknown[]).map(n=>text(n,60));requireValue(names.every(Boolean),'Every student needs a name or nickname.');
 const username=text(data.parentUsername,40).toLowerCase();let parentId=ROSTER_ID;
 if(username){const account=await env.DB.prepare('SELECT id FROM accounts WHERE username=? AND id<>?').bind(username,ROSTER_ID).first<{id:string}>();requireValue(account,'Parent account not found. Leave the field empty to link a parent later.');parentId=account!.id;}
 const students=await Promise.all(names.map(async name=>{const claim=parentId===ROSTER_ID?random():null;return {id:crypto.randomUUID(),name,claim,claimHash:claim?await hash(claim):null}}));
 const statements=[env.DB.prepare('INSERT OR IGNORE INTO accounts VALUES(?,?,?,?,?)').bind(ROSTER_ID,ROSTER_USERNAME,random(),random(),now)];
 for(const c of students){statements.push(env.DB.prepare('INSERT INTO children VALUES(?,?,?,?,1,?)').bind(c.id,parentId,groupId,c.name,now));if(c.claimHash)statements.push(env.DB.prepare('INSERT INTO student_claims VALUES(?,?,?)').bind(c.id,c.claimHash,now+14*86400000));}
 await env.DB.batch(statements);return respond({students:students.map(({id,name,claim})=>({id,name,claim}))});
 }
 if(path==='/move-student'&&request.method==='POST'){
 teacher();const id=text(data.childId,80),groupId=text(data.groupId,80);requireValue(await env.DB.prepare('SELECT id FROM children WHERE id=?').bind(id).first(),'Student not found.');requireValue(await env.DB.prepare('SELECT id FROM groups WHERE id=?').bind(groupId).first(),'Choose an existing class.');
 const name=data.name===undefined?null:text(data.name,60);requireValue(name===null||name,'Enter a student name.');
 await env.DB.prepare('UPDATE children SET group_id=?,name=COALESCE(?,name) WHERE id=?').bind(groupId,name,id).run();return respond({saved:true});
 }
 if(path==='/student-link'&&request.method==='POST'){
 teacher();const id=text(data.childId,80);requireValue(await env.DB.prepare('SELECT id FROM children WHERE id=?').bind(id).first(),'Student not found.');
 if(data.revoke===true){await env.DB.batch([env.DB.prepare('DELETE FROM student_sessions WHERE child_id=?').bind(id),env.DB.prepare('DELETE FROM student_links WHERE child_id=?').bind(id)]);return respond({saved:true});}
 const access=random();await env.DB.batch([env.DB.prepare('DELETE FROM student_sessions WHERE child_id=?').bind(id),env.DB.prepare('INSERT INTO student_links VALUES(?,?) ON CONFLICT(child_id) DO UPDATE SET access_hash=excluded.access_hash').bind(id,await hash(access))]);return respond({access});
 }
 if(path==='/student-invite'&&request.method==='POST'){
 teacher();const id=text(data.childId,80);requireValue(await env.DB.prepare('SELECT id FROM children WHERE id=? AND parent_id=?').bind(id,ROSTER_ID).first(),'This student is already linked to a parent, or could not be found.');const claim=random();
 await env.DB.prepare('INSERT INTO student_claims VALUES(?,?,?) ON CONFLICT(child_id) DO UPDATE SET claim_hash=excluded.claim_hash,expires=excluded.expires').bind(id,await hash(claim),now+14*86400000).run();return respond({claim});
 }
 if(path==='/student-claim'&&request.method==='POST'){
 if(session.role!=='parent')throw new Failure('Parent account required.',403);const claim=await hash(text(data.claim,80));
 const result=await env.DB.batch([env.DB.prepare('UPDATE children SET parent_id=? WHERE parent_id=? AND id IN (SELECT child_id FROM student_claims WHERE claim_hash=? AND expires>?)').bind(session.account_id,ROSTER_ID,claim,now),env.DB.prepare('DELETE FROM student_claims WHERE claim_hash=? AND child_id IN (SELECT id FROM children WHERE parent_id=?)').bind(claim,session.account_id)]);
 requireValue(result[0].meta.changes===1,'This student link has expired or has already been used. Ask your teacher for a new link.');return respond({saved:true});
 }
 if(path==='/approve'&&request.method==='POST'){teacher();requireValue(typeof data.approved==='boolean','Choose approval status.');await env.DB.prepare('UPDATE children SET approved=? WHERE id=?').bind(Number(data.approved),text(data.childId,80)).run();return respond({saved:true})}
 if(path==='/assignments'&&request.method==='POST'){
 teacher();const groupId=text(data.groupId,80);requireValue(await env.DB.prepare('SELECT id FROM groups WHERE id=?').bind(groupId).first(),'Choose a class.');
 const unit=lessons.find(u=>u.id===data.unitId);requireValue(unit,'Choose a lesson.');if(!unit)throw new Failure('Unknown lesson.');
 const activities=Array.isArray(data.activities)?[...new Set(data.activities)]:[];
 requireValue(activities.length&&activities.every(a=>available(unit).includes(a as Exclude<ActivityId,'picture-speak'>)),'Choose supported activities.');
 const wordIds=Array.isArray(data.wordIds)?[...new Set(data.wordIds)]:unit.words.map(w=>w.id);
 requireValue(wordIds.every(id=>unit.words.some(w=>w.id===id)),'Choose words from this lesson.');
 if(activities.some(a=>!['video','story','reading','story-quiz','story-order'].includes(String(a))))requireValue(wordIds.length>=4,'Choose at least four words for vocabulary activities.');
 const due=text(data.dueDate,10);requireValue(!due||/^\d{4}-\d{2}-\d{2}$/.test(due),'Choose a valid due date.');
 const id=text(data.id,80)||crypto.randomUUID();if(data.id)requireValue(await env.DB.prepare('SELECT id FROM assignments WHERE id=? AND group_id=?').bind(id,groupId).first(),'Assignment not found.');
 // Editing an assignment keeps word reviews but resets its checklist for the revised work.
 await env.DB.batch([env.DB.prepare('DELETE FROM completions WHERE assignment_id=?').bind(id),env.DB.prepare('INSERT INTO assignments VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET unit_id=excluded.unit_id,title=excluded.title,activities=excluded.activities,word_ids=excluded.word_ids,due_date=excluded.due_date,updated_at=excluded.updated_at').bind(id,groupId,unit.id,text(data.title,120)||unit.title,JSON.stringify(activities),JSON.stringify(wordIds),due,Math.max(now,Number((await env.DB.prepare('SELECT MAX(created_at) AS latest FROM attempts WHERE assignment_id=?').bind(id).first<{latest:number|null}>())?.latest||0)+1))]);return respond({id});
 }
 if(path==='/delete-assignment'&&request.method==='POST'){teacher();const id=text(data.id,80);await env.DB.batch([env.DB.prepare('DELETE FROM completions WHERE assignment_id=?').bind(id),env.DB.prepare('DELETE FROM attempts WHERE assignment_id=?').bind(id),env.DB.prepare('DELETE FROM assignments WHERE id=?').bind(id)]);return respond({saved:true})}
 if(path==='/family'&&request.method==='GET'){
 if(scopedChild){const children=await env.DB.prepare('SELECT c.id,c.name,c.approved,c.group_id,g.name AS group_name FROM children c JOIN groups g ON g.id=c.group_id WHERE c.id=?').bind(scopedChild).all();return respond({children:children.results});}
 if(session.role!=='parent')throw new Failure('Parent account required.',403);
 const children=await env.DB.prepare('SELECT c.id,c.name,c.approved,c.group_id,g.name AS group_name FROM children c JOIN groups g ON g.id=c.group_id WHERE parent_id=? ORDER BY c.created_at').bind(session.account_id).all();return respond({children:children.results});
 }
 if(path==='/children'&&request.method==='POST'){
 if(session.role!=='parent')throw new Failure('Parent account required.',403);
 const group=await env.DB.prepare('SELECT id FROM groups WHERE invite_hash=?').bind(await hash(text(data.invite,80))).first<{id:string}>();requireValue(group,'This invitation is invalid or has been replaced. Ask your teacher for a new QR.');
 const name=text(data.name,60);requireValue(name,'Enter a child’s name or nickname.');const count=await env.DB.prepare('SELECT COUNT(*) AS n FROM children WHERE parent_id=?').bind(session.account_id).first<{n:number}>();requireValue((count?.n||0)<10,'This account already has ten child profiles.');
 const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO children VALUES(?,?,?,?,0,?)').bind(id,session.account_id,group!.id,name,now).run();return respond({id});
 }
 if(path==='/homework'&&request.method==='GET'){
 const child=await childAccess(new URL(request.url).searchParams.get('child'));if(!child.approved)return respond({assignments:[],progress:{},completed:[],pending:true});
 const [assignments,reviews,completed]=await Promise.all([env.DB.prepare('SELECT * FROM assignments WHERE group_id=? ORDER BY due_date,updated_at').bind(child.group_id).all(),env.DB.prepare('SELECT word_id,step,due FROM reviews WHERE child_id=?').bind(child.id).all(),env.DB.prepare('SELECT assignment_id,activity FROM completions WHERE child_id=?').bind(child.id).all()]);
 await syncHomeworkRewards(env.DB,child.id,assignments.results as {id:string;activities:string;title:string;updated_at:number}[],now);
 const rewards=await readRewards(env.DB,child.id);
 return respond({dashboard:await studentDashboard(env.DB,child,now),rewards,assignments:assignments.results,progress:Object.fromEntries(reviews.results.map(r=>[r.word_id,{step:r.step,due:r.due}])),completed:completed.results,pending:false});
 }
 if(path==='/practice-progress'&&request.method==='POST'){
 const child=await childAccess(data.childId);requireValue(child.approved,'Your teacher needs to approve this profile.');
 const unit=lessons.find(l=>l.id===text(data.unitId,100)),wordId=text(data.wordId,100);
 requireValue(unit?.words.some(w=>w.id===wordId),'This word is unavailable.');
 requireValue(typeof data.correct==='boolean','An answer result is required.');
 if(data.correction!==true)await env.DB.prepare(`INSERT INTO reviews(child_id,word_id,step,due) VALUES(?,?,?,?) ON CONFLICT(child_id,word_id) DO UPDATE SET step=CASE WHEN ?=0 THEN 0 WHEN reviews.due>? THEN reviews.step ELSE MIN(reviews.step+1,4) END,due=CASE WHEN ?=0 THEN ? WHEN reviews.due>? THEN reviews.due ELSE ?+CASE MIN(reviews.step+1,4) WHEN 1 THEN 86400000 WHEN 2 THEN 259200000 WHEN 3 THEN 604800000 ELSE 1209600000 END END`).bind(child.id,wordId,data.correct?1:0,now+(data.correct?86400000:600000),Number(data.correct),now,Number(data.correct),now+600000,now,now).run();
 const reviews=await env.DB.prepare('SELECT word_id,step,due FROM reviews WHERE child_id=?').bind(child.id).all();
 return respond({progress:Object.fromEntries(reviews.results.map(r=>[r.word_id,{step:r.step,due:r.due}]))});
 }
 if(path==='/progress'&&request.method==='POST'){
 const child=await childAccess(data.childId);requireValue(child.approved,'Your teacher needs to approve this profile.');
 const assignment=await env.DB.prepare('SELECT * FROM assignments WHERE id=? AND group_id=?').bind(text(data.assignmentId,80),child.group_id).first<{id:string;unit_id:string;activities:string;word_ids:string;updated_at:number}>();requireValue(assignment,'This assignment is no longer available. Refresh your homework.');
 const activities=JSON.parse(assignment!.activities) as string[];const activity=text(data.activity,40);requireValue(activities.includes(activity),'This activity is not assigned.');
 requireValue(data.complete!==true,'Homework finishes automatically after the required answers.');
 if(activity==='story-quiz'||activity==='story-order'){
 const story=lessons.find(l=>l.id===assignment!.unit_id)?.readingStory;requireValue(story,'This story is unavailable.');
 const itemId=text(data.wordId,100),answer=text(data.answer,300);
 const correct=checkStoryAnswer(story!,activity,itemId,answer);requireValue(correct!==null,'Choose a valid story answer.');
 const id=text(data.eventId,80);requireValue(/^[a-zA-Z0-9-]{16,80}$/.test(id),'An answer identifier is required.');
 const answerTime=Math.max(now,Number(assignment!.updated_at));
 const required=activity==='story-quiz'?story!.questions.length:story!.orders.length;
 // Story comprehension has its own completion requirements and never changes word SRS.
 const inserted=await env.DB.batch([
 env.DB.prepare('INSERT OR IGNORE INTO attempts VALUES(?,?,?,?,?,?,?)').bind(id,child.id,assignment!.id,activity,itemId,Number(correct),answerTime),
 env.DB.prepare(`INSERT OR IGNORE INTO completions(child_id,assignment_id,activity,completed_at) SELECT ?,?,?,? WHERE (SELECT COUNT(DISTINCT word_id) FROM attempts WHERE child_id=? AND assignment_id=? AND correct=1 AND created_at>=? AND activity=?)>=?`).bind(child.id,assignment!.id,activity,answerTime,child.id,assignment!.id,assignment!.updated_at,activity,required)
 ]);
 await syncHomeworkRewards(env.DB,child.id,[assignment!],now);
 const rewards=await readRewards(env.DB,child.id);
 const completed=await env.DB.prepare('SELECT assignment_id,activity FROM completions WHERE child_id=?').bind(child.id).all();
 return respond({saved:true,rewards,correct,duplicate:inserted[0].meta.changes===0,completed:completed.results});
 }
 requireValue(typeof data.correct==='boolean','An answer result is required.');const wordId=text(data.wordId,100);requireValue(JSON.parse(assignment!.word_ids).includes(wordId),'This word is not assigned.');
 const stage=text(data.stage,20);const attemptActivity=activity==='lesson'?activity+':'+stage:activity;
 if(activity==='lesson')requireValue(['listen','spell','sentence'].includes(stage),'Unknown lesson exercise.');
 const answerTime=Math.max(now,Number(assignment!.updated_at));
 const id=text(data.eventId,80);requireValue(/^[a-zA-Z0-9-]{16,80}$/.test(id),'An answer identifier is required.');
 // One atomic batch: an already acknowledged answer never changes the review schedule twice.
 const inserted=await env.DB.batch([
 env.DB.prepare('INSERT OR IGNORE INTO attempts VALUES(?,?,?,?,?,?,?)').bind(id,child.id,assignment!.id,attemptActivity,wordId,Number(data.correct),answerTime),
 ...(data.correction===true?[]:[env.DB.prepare(`INSERT INTO reviews(child_id,word_id,step,due) SELECT ?,?, ?,? WHERE changes()=1 ON CONFLICT(child_id,word_id) DO UPDATE SET step=CASE WHEN ?=0 THEN 0 WHEN reviews.due>? THEN reviews.step ELSE MIN(reviews.step+1,4) END,due=CASE WHEN ?=0 THEN ? WHEN reviews.due>? THEN reviews.due ELSE ?+CASE MIN(reviews.step+1,4) WHEN 1 THEN 86400000 WHEN 2 THEN 259200000 WHEN 3 THEN 604800000 ELSE 1209600000 END END`).bind(child.id,wordId,data.correct?1:0,now+(data.correct?86400000:600000),Number(data.correct),now,Number(data.correct),now+600000,now,now)]),
 ...(requiresAnswers(activity)?[env.DB.prepare(`INSERT OR IGNORE INTO completions(child_id,assignment_id,activity,completed_at) SELECT ?,?,?,? WHERE (SELECT COUNT(DISTINCT activity || word_id) FROM attempts WHERE child_id=? AND assignment_id=? AND correct=1 AND created_at>=? AND ${activity==='lesson'?"activity IN ('lesson:listen','lesson:spell','lesson:sentence')":'activity=?'} )>=?`).bind(child.id,assignment!.id,activity,answerTime,child.id,assignment!.id,assignment!.updated_at,...(activity==='lesson'?[]:[activity]),activity==='lesson'?JSON.parse(assignment!.word_ids).length*2+Math.min(4,lessons.find(l=>l.id===assignment!.unit_id)!.words.filter(w=>JSON.parse(assignment!.word_ids).includes(w.id)&&w.sentence.trim().split(/\s+/).length>1).length):JSON.parse(assignment!.word_ids).length)]:[])
 ]);
 await syncHomeworkRewards(env.DB,child.id,[assignment!],now);
 const rewards=await readRewards(env.DB,child.id);
 const completed=await env.DB.prepare('SELECT assignment_id,activity FROM completions WHERE child_id=?').bind(child.id).all();
 return respond({saved:true,rewards,duplicate:inserted[0].meta.changes===0,completed:completed.results});
 }
 throw new Failure('Page not found.',404);
 }catch(error){if(error instanceof Failure||error instanceof StaffError)return respond({error:error.message},error.status);return respond({error:'Could not save or load the classroom. Please try again.'},503)}
}
export default {fetch:handle};

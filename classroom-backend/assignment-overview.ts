import type {D1Database} from '@cloudflare/workers-types';
import {lessons} from '../github-pages/lessons';
import {studentHomeworkProgress,homeworkItems} from '../lib/student-homework-progress';
import type {TeacherAssignment,AssignmentOverview} from '../lib/teacher-homework';
export async function archivedAssignments(db:D1Database){const r=await db.prepare("SELECT key FROM config WHERE key LIKE 'assignment_archived:%' AND value='1'").all<{key:string}>();return new Set(r.results.map(r=>r.key.slice('assignment_archived:'.length)))}
export async function assignmentOverview(db:D1Database,group:string):Promise<{assignments:AssignmentOverview[]}>{
 const [children,assignments,attempts,completed]=await Promise.all([
 db.prepare('SELECT id,name FROM children WHERE group_id=? AND approved=1 ORDER BY name').bind(group).all<{id:string;name:string}>(),
 db.prepare('SELECT * FROM assignments WHERE group_id=?').bind(group).all<TeacherAssignment>(),
 db.prepare('SELECT t.* FROM attempts t JOIN children c ON c.id=t.child_id WHERE c.group_id=?').bind(group).all<any>(),
 db.prepare('SELECT x.* FROM completions x JOIN children c ON c.id=x.child_id WHERE c.group_id=?').bind(group).all<any>()]);
 const rows=assignments.results.map(a=>{const students=children.results.map(c=>{const answers=attempts.results.filter(t=>t.child_id===c.id&&t.assignment_id===a.id),last=answers.filter(t=>Number(t.created_at)>=Number(a.updated_at)).map(t=>Number(t.created_at));return {...c,lastSeen:last.length?Math.max(...last):null,progress:studentHomeworkProgress([a],lessons,answers,completed.results.filter(x=>x.child_id===c.id))[a.id]}});return {id:a.id,students,finished:students.filter(s=>s.progress.total>0&&s.progress.percent===100).length,totalStudents:students.length,percent:students.length?Math.floor(students.reduce((n,s)=>n+(s.progress.total?s.progress.percent:0),0)/students.length):0}});
 return {assignments:rows};
}
// Keep this assignment version so matching saved answers and active practice time survive edits.
export async function preservedChecklist(db:D1Database,old:TeacherAssignment,next:TeacherAssignment,now:number){
 const [attempts,completed,children]=await Promise.all([db.prepare('SELECT * FROM attempts WHERE assignment_id=?').bind(old.id).all<any>(),db.prepare('SELECT * FROM completions WHERE assignment_id=?').bind(old.id).all<any>(),db.prepare('SELECT id FROM children WHERE group_id=?').bind(old.group_id).all<{id:string}>()]);
 const lesson=lessons.find(l=>l.id===next.unit_id),statements=[db.prepare('DELETE FROM completions WHERE assignment_id=?').bind(old.id)];
 for(const c of children.results){const prior=completed.results.filter(x=>x.child_id===c.id);const unchanged=prior.filter(x=>(JSON.parse(old.activities) as string[]).includes(x.activity)&&JSON.stringify(homeworkItems(old,lesson,x.activity).sort())===JSON.stringify(homeworkItems(next,lesson,x.activity).sort()));const progress=studentHomeworkProgress([next],lessons,attempts.results.filter(x=>x.child_id===c.id),unchanged.map(x=>({...x,assignment_id:next.id})))[next.id];
 for(const e of progress.exercises)if(e.total>0&&e.done===e.total)statements.push(db.prepare('INSERT OR IGNORE INTO completions VALUES(?,?,?,?)').bind(c.id,next.id,e.activity,Number(prior.find(x=>x.activity===e.activity)?.completed_at)||now));}
 return statements;
}

export async function retireAssignmentRuns(db:D1Database,id:string){const runs=await db.prepare('SELECT id,day,tasks FROM daily_runs WHERE group_id=(SELECT group_id FROM assignments WHERE id=?)').bind(id).all<{id:string;day:string;tasks:string}>();for(const r of runs.results)if(/^\d{4}-\d{2}-\d{2}$/.test(r.day)&&JSON.parse(r.tasks).some((t:any)=>t.assignmentId===id))await db.prepare('UPDATE daily_runs SET day=? WHERE id=?').bind(r.day+':archived:'+r.id,r.id).run();}

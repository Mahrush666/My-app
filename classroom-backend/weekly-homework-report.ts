import type {D1Database} from '@cloudflare/workers-types';
import {lessons} from '../github-pages/lessons';
import {studentHomeworkProgress,homeworkItems} from '../lib/student-homework-progress';
import {requiresAnswers} from '../lib/homework-completion';
import type {WeeklyClass} from '../lib/weekly-homework-report';
import {addDays,chinaDay} from '../lib/teacher-dashboard';
export async function weeklyHomeworkReport(db:D1Database,group:string,week:string):Promise<WeeklyClass>{
 const end=addDays(week,7),startTime=Date.parse(week+'T00:00:00+08:00'),endTime=startTime+7*86400000;
 const [children,assignments,attempts,completed]=await Promise.all([
 db.prepare('SELECT id,name FROM children WHERE group_id=? AND approved=1 ORDER BY name').bind(group).all<{id:string;name:string}>(),
 db.prepare('SELECT * FROM assignments WHERE group_id=?').bind(group).all<any>(),
 db.prepare('SELECT t.* FROM attempts t JOIN children c ON c.id=t.child_id WHERE c.group_id=?').bind(group).all<any>(),
 db.prepare('SELECT x.* FROM completions x JOIN children c ON c.id=x.child_id WHERE c.group_id=?').bind(group).all<any>()]);
 // Include homework due/assigned in the week and older assignments practised that week.
 const tasks=assignments.results.filter(a=>{const day=a.due_date||chinaDay(Number(a.updated_at));if(Number(a.updated_at)>=endTime)return false;return (day>=week&&day<end)||attempts.results.some(t=>t.assignment_id===a.id&&Number(t.created_at)>=Math.max(startTime,Number(a.updated_at))&&Number(t.created_at)<endTime)});
 const students=children.results.map(c=>{
 const answers=attempts.results.filter(t=>t.child_id===c.id&&Number(t.created_at)<endTime),finished=completed.results.filter(x=>x.child_id===c.id&&Number(x.completed_at)<endTime);
 const progress=studentHomeworkProgress(tasks,lessons,answers,finished),details=tasks.map(a=>({id:a.id,title:a.title,progress:progress[a.id]}));
 let reviewed=0,lastSeen:number|null=null;
 for(const a of tasks){const lesson=lessons.find(l=>l.id===a.unit_id),items=new Set((JSON.parse(a.activities) as string[]).filter(requiresAnswers).flatMap(activity=>homeworkItems(a,lesson,activity)));
 const first=new Map<string,number>();
 for(const t of answers.filter(t=>t.assignment_id===a.id&&Number(t.created_at)>=Number(a.updated_at))){const at=Number(t.created_at);if(at>=startTime)lastSeen=Math.max(lastSeen||0,at);const key=(t.activity.startsWith('reactor:')?'reactor':t.activity)+':'+t.word_id;if(Number(t.correct)&&items.has(key))first.set(key,Math.min(first.get(key)||Infinity,at))}
 reviewed+=[...first.values()].filter(at=>at>=startTime).length;
 }
 const done=details.reduce((n,a)=>n+a.progress.done,0),total=details.reduce((n,a)=>n+a.progress.total,0);
 return {...c,assignments:details,done,total,percent:total?Math.floor(done/total*100):0,reviewed,lastSeen};
 }).sort((a,b)=>b.percent-a.percent||b.reviewed-a.reviewed||a.name.localeCompare(b.name));
 const eligible=students.filter(s=>s.total>0);
 return {week,students,percent:eligible.length?Math.round(eligible.reduce((n,c)=>n+c.percent,0)/eligible.length):0,reviewed:students.reduce((n,s)=>n+s.reviewed,0),done:students.reduce((n,s)=>n+s.done,0),total:students.reduce((n,s)=>n+s.total,0)};
}

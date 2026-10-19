import {requiresAnswers} from './homework-completion';
export type SchoolGroup={id:string;name:string};
export type SchoolChild={id:string;name:string;group_id:string;approved:number};
export type ClassMeeting={id:string;group_id:string;day:string;time:string;duration:number};
export type AttendanceMark={meeting_id:string;child_id:string;status:string;name:string};
export const chinaDay=(value:number=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
export function addDays(day:string,count:number){return new Date(Date.parse(day+'T00:00:00Z')+count*86400000).toISOString().slice(0,10)}
export function weekStart(day:string){return addDays(day,-((new Date(day+'T00:00:00Z').getUTCDay()+6)%7))}
export function validDay(day:string){return /^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day+'T00:00:00Z'))&&new Date(day+'T00:00:00Z').toISOString().slice(0,10)===day}
export function weeklyProgress(groups:SchoolGroup[],children:SchoolChild[],assignments:{id:string;group_id:string;activities:string;due_date:string;updated_at:number}[],reports:{child_id:string;assignment_id:string;completed:string}[],week:string){
 const end=addDays(week,7);
 return groups.map(group=>{
 const tasks=assignments.filter(a=>{const day=a.due_date||chinaDay(Number(a.updated_at));return a.group_id===group.id&&day>=week&&day<end}).map(a=>({...a,required:(JSON.parse(a.activities) as string[]).filter(requiresAnswers)}));
 const students=children.filter(c=>c.group_id===group.id&&c.approved).map(c=>{let done=0,total=0;for(const task of tasks){const completed=JSON.parse(reports.find(r=>r.child_id===c.id&&r.assignment_id===task.id)?.completed||'[]') as string[];total+=task.required.length;done+=task.required.filter(a=>completed.includes(a)).length;}return {...c,done,total}});
 return {...group,students,done:students.reduce((s,c)=>s+c.done,0),total:students.reduce((s,c)=>s+c.total,0)};
 });
}

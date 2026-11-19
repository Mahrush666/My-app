import {requiresAnswers} from './homework-completion';
import {countsForHomework} from './teacher-homework';

type Student={id:string;name:string;approved:number};
type Assignment={id:string;activities:string;archived?:boolean};
type Report={child_id:string;assignment_id:string;completed:string};
export type StudentHomeworkStatus={childId:string;total:number;finished:number;unfinished:number};

// Report rows are the authoritative assignment membership, including homework
// retained when a student changes class. The caller supplies its visible roster.
export function studentHomeworkStatus(students:Student[],assignments:Assignment[],reports:Report[]):StudentHomeworkStatus[]{
 const required=new Map(assignments.filter(a=>!a.archived).map(a=>[a.id,(JSON.parse(a.activities) as string[]).filter(requiresAnswers)]));
 const completion=new Map<string,Map<string,Set<string>>>();
 for(const report of reports){
  if(!required.get(report.assignment_id)?.length)continue;
  if(!completion.has(report.child_id))completion.set(report.child_id,new Map());
  const tasks=completion.get(report.child_id)!;
  if(!tasks.has(report.assignment_id))tasks.set(report.assignment_id,new Set());
  for(const activity of JSON.parse(report.completed) as string[])tasks.get(report.assignment_id)!.add(activity);
 }
 return students.filter(c=>c.approved&&countsForHomework(c)).flatMap(c=>{
  const tasks=completion.get(c.id);if(!tasks?.size)return [];
  const finished=[...tasks].filter(([id,done])=>required.get(id)!.every(activity=>done.has(activity))).length;
  return [{childId:c.id,total:tasks.size,finished,unfinished:tasks.size-finished}];
 });
}

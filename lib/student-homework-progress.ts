import type {Lesson} from '../github-pages/lessons';
import {requiresAnswers} from './homework-completion';
export type ExerciseProgress={activity:string;done:number;total:number;finished:boolean};
export type HomeworkProgress={done:number;total:number;percent:number;exercises:ExerciseProgress[]};
type Assignment={id:string;unit_id:string;activities:string;word_ids:string;updated_at:number};
type Attempt={assignment_id:string;activity:string;word_id:string|null;correct:number;created_at:number};
export function studentHomeworkProgress(assignments:Assignment[],lessons:Lesson[],attempts:Attempt[],completed:{assignment_id:string;activity:string}[]):Record<string,HomeworkProgress>{
 return Object.fromEntries(assignments.map(a=>{
 const lesson=lessons.find(l=>l.id===a.unit_id),ids=JSON.parse(a.word_ids) as string[],words=lesson?.words.filter(w=>ids.includes(w.id!))||[];
 const current=attempts.filter(t=>t.assignment_id===a.id&&Number(t.created_at)>=Number(a.updated_at)&&Number(t.correct)===1);
 const exercises=(JSON.parse(a.activities) as string[]).filter(requiresAnswers).map(activity=>{
 let items:string[]=[];
 if(activity==='story-quiz')items=lesson?.readingStory?.questions.map(q=>activity+':'+q.id)||[];
 else if(activity==='story-order')items=lesson?.readingStory?.orders.map(q=>activity+':'+q.id)||[];
 else if(activity==='sentence-speak')items=(lesson?.sentencePractice?.map(s=>s.id)||words.filter(w=>w.sentence.trim().split(/\s+/).length>1).map(w=>w.id!)).map(id=>activity+':'+id);
 else if(activity==='spell')items=ids.flatMap(id=>[1,2,3,4,5].map(step=>(step===5?'spell':'spell:step'+step)+':'+id));
 else if(activity==='lesson')items=[...ids.flatMap(id=>['lesson:listen:'+id,'lesson:spell:'+id]),...words.filter(w=>w.sentence.trim().split(/\s+/).length>1).slice(0,4).map(w=>'lesson:sentence:'+w.id)];
 else items=ids.map(id=>activity+':'+id);
 const answered=new Set(current.map(t=>(activity==='reactor'&&t.activity.startsWith('reactor:')?'reactor':t.activity)+':'+t.word_id));
 const finished=completed.some(c=>c.assignment_id===a.id&&c.activity===activity),total=items.length;
 return {activity,done:finished?total:items.filter(i=>answered.has(i)).length,total,finished};
 });
 const total=exercises.reduce((s,e)=>s+e.total,0),done=exercises.reduce((s,e)=>s+e.done,0);
 return [a.id,{done,total,percent:total?Math.floor(done/total*100):100,exercises}];
 }));
}

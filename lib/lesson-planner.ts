import {act2Course,act3Course} from './act-courses';
import {powerUp1Course} from './power-up-1-course';
import type {Lesson} from '../github-pages/lessons';
export type PlannerKind='plan'|'progress'|'lesson'|'resource'|'profile';
export type PlannerBase={id:string;revision:number;updatedAt:number};
export type PlannerBlock={id:string;stage:string;kind:'song'|'game'|'activity'|'notes';resourceId:string;title:string;minutes:number;instructions:string;comments:string;url:string};
export type PlannerPlan=PlannerBase&{kind:'plan';groupId:string;lessonId:string;book:string;unit:number;title:string;date:string;duration:number;status:'draft'|'ready';objectives:string;comments:string;blocks:PlannerBlock[]};
export type PlannerProgress=PlannerBase&{kind:'progress';groupId:string;book:string;unit:number;lessonId:string;profileId:string;age:string;level:string;difficulty:string;notes:string};
export type PlannerLesson=PlannerBase&{kind:'lesson';groupId:string;book:string;unit:number;title:string;afterId:string;focus:string};
export type PlannerResource=PlannerBase&{kind:'resource';resourceKind:'song'|'game'|'activity';title:string;skills:string;levels:string;minutes:number;materials:string;instructions:string;url:string};
export type PlannerProfile=PlannerBase&{kind:'profile';title:string;age:string;level:string;difficulty:string;recommendations:string};
export type PlannerRecord=PlannerPlan|PlannerProgress|PlannerLesson|PlannerResource|PlannerProfile;
export type CurriculumLesson={id:string;book:string;unit:number;title:string;custom?:boolean;focus?:string};
export const plannerTemplates={
 integrated:[['Warm-up',5],['Introduce and model',10],['Guided practice',10],['Game or song',10],['Review and homework',5]],
 phonics:[['Sound review',5],['Model and blend',10],['Build the words',10],['Read independently',10],['Wrap-up',5]],
 review:[['Recall warm-up',5],['Review activity',10],['Game',15],['Wrap-up',10]],
} as const;
export const freshId=()=>crypto.randomUUID();
export function templateBlocks(template:keyof typeof plannerTemplates,duration:number):PlannerBlock[]{
 const items=plannerTemplates[template],total=items.reduce((n,x)=>n+x[1],0);let used=0;
 return items.map(([stage,time],i)=>{const minutes=i===items.length-1?duration-used:Math.round(time/total*duration);used+=minutes;return {id:freshId(),stage,kind:'notes',resourceId:'',title:'',minutes,instructions:'',comments:'',url:''}});
}
const outlines=[act2Course,act3Course,powerUp1Course];
export function plannerBooks(lessons:Lesson[],records:PlannerRecord[]){return [...new Set([...outlines.map(c=>c.book),...lessons.map(l=>l.book),...records.filter(r=>r.kind==='lesson').map(r=>(r as PlannerLesson).book)])].sort()}
export function plannerUnits(book:string,lessons:Lesson[],records:PlannerRecord[]){
 const units=new Map<number,string>();
 for(const course of outlines)if(course.book===book)for(const u of course.units)units.set(u.number,u.title);
 for(const l of lessons)if(l.book===book)units.set(l.unit?.number||0,units.get(l.unit?.number||0)||l.unit?.title||'Lessons');
 for(const r of records)if(r.kind==='lesson'&&r.book===book&&!units.has(r.unit))units.set(r.unit,'Unit '+r.unit);
 return [...units].sort((a,b)=>a[0]-b[0]).map(([number,title])=>({number,title}));
}
export function plannerCurriculum(book:string,unit:number,groupId:string,lessons:Lesson[],records:PlannerRecord[]):CurriculumLesson[]{
 const base:CurriculumLesson[]=lessons.filter(l=>l.book===book&&(l.unit?.number||0)===unit).map(l=>({id:l.id,book,unit,title:l.lessonTitle||l.title}));
 const custom=records.filter((r):r is PlannerLesson=>r.kind==='lesson'&&r.book===book&&r.unit===unit&&(!r.groupId||r.groupId===groupId)).sort((a,b)=>a.updatedAt-b.updatedAt||a.id.localeCompare(b.id));
 const result:CurriculumLesson[]=[],seen=new Set<string>();
 function append(after:string){for(const l of custom)if(l.afterId===after&&!seen.has(l.id)){seen.add(l.id);result.push({...l,custom:true});append(l.id)}}
 append('');for(const l of base){result.push(l);append(l.id)}
 // Keep additions visible if their anchor belongs to another group or is no longer available.
 for(const l of custom)if(!seen.has(l.id)){seen.add(l.id);result.push({...l,custom:true});append(l.id)}
 return result;
}
export function plannerSuggestion(book:string,unit:number){if(!['ACT2','ACT3'].includes(book))return '';return `${book} Unit ${unit}: optional phonics / CVC practice. Choose only letter sounds already taught; add a short review lesson if this group needs more practice.`}

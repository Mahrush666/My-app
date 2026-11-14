import type {Lesson} from './lessons';
const catalogBooks=['English Math — My Pals Are Here','AI course'];
export const emptyBookMessage='No lessons have been added yet. 暂无课程。';
export function bookNames(lessons:Lesson[],includeEmpty=false){
 return [...new Set([...lessons.map(lesson=>lesson.book),...(includeEmpty?catalogBooks:[])])];
}
export function bookUnits(lessons:Lesson[],book:string){
 const units=new Map<string,NonNullable<Lesson['unit']>>();
 for(const lesson of lessons)if(lesson.book===book&&lesson.unit)units.set(lesson.unit.id,lesson.unit);
 return [...units.values()].sort((a,b)=>a.number-b.number);
}
export function lessonLabel(lesson:Lesson){return lesson.lessonTitle||lesson.title;}

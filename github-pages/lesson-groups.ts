import type {Lesson} from './lessons';
export function bookUnits(lessons:Lesson[],book:string){
 const units=new Map<string,NonNullable<Lesson['unit']>>();
 for(const lesson of lessons)if(lesson.book===book&&lesson.unit)units.set(lesson.unit.id,lesson.unit);
 return [...units.values()].sort((a,b)=>a.number-b.number);
}
export function lessonLabel(lesson:Lesson){return lesson.lessonTitle||lesson.title;}

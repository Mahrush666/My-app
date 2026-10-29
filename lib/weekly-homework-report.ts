import type {HomeworkProgress} from './student-homework-progress';
export type WeeklyStudent={id:string;name:string;done:number;total:number;percent:number;reviewed:number;lastSeen:number|null;assignments:{id:string;title:string;progress:HomeworkProgress}[]};
export type WeeklyClass={week:string;students:WeeklyStudent[];percent:number;reviewed:number;done:number;total:number};
export const progressTone=(percent:number)=>percent>=100?'green':percent>=70?'blue':percent>=40?'amber':percent>0?'coral':'grey';

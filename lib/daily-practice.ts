import type {Word} from '../app/words';
export type DailyTask={id:string;assignmentId:string;unitId:string;activity:string;wordId:string;kind:'written'|'audio-options'|'pictures'|'letters'|'sentence';prompt:string;image?:string;listen?:string;expected:string;options?:{id:string;text:string;image?:string}[]};
export type DailyRun={enabled:boolean;day:string;id?:string;tasks?:DailyTask[];done?:string[];finished?:boolean;message?:string};
export const dailyDay=(now:number)=>new Date(now+8*3600000).toISOString().slice(0,10);
export const dailyWord=(w:Word)=>({id:w.id!,text:w.en,image:w.picture});

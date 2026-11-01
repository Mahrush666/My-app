import type {ActivityId} from './unit-activities';
const vocabularyLessons=new Set([1,5,9]);
export function beehiveLessonNumber(id?:string){return Number(id?.match(/^beehive1-u4-lesson(\d+)$/)?.[1]||0)}
export function beehiveActivityAllowed(id:string|undefined,activity:string){
 const n=beehiveLessonNumber(id);if(!n||vocabularyLessons.has(n))return true;
 return ['video','reading','story-quiz','story-order','sentence-speak'].includes(activity);
}
export function beehiveActivities(id:string,activities:string[],fallback:ActivityId[]):ActivityId[]{const kept=activities.filter(a=>beehiveActivityAllowed(id,a)) as ActivityId[];return kept.length?kept:fallback}

export const beehiveContextDefaults:Record<number,ActivityId[]>={2:['video','story-quiz'],3:['video','story-quiz'],4:['story-quiz'],6:['video','story-quiz'],7:['reading','story-quiz'],8:['reading','story-quiz'],10:['reading','story-quiz']};

export function beehiveMissionName(id?:string){const n=beehiveLessonNumber(id);return n===3||n===4?'Animal Detective 动物侦探':n===6?'Build the Scene 布置场景':n===7?'Coconut Rescue 椰子救援':undefined}

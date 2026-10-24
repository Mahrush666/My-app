import {enabledActivities,type ActivityId} from './unit-activities';
// Preparation, recognition, reading, spelling, then the archer game.
const order:ActivityId[]=['look-listen','video','story','picture-listen','sound-picture','yes-no','cards','word-choice','word-sound','sound-word','match','reading','lesson','story-order','story-quiz','sentence-speak','spell','ward','sprint','reactor'];
export function orderHomeworkActivities(selected:ActivityId[],lookListenAvailable=false):ActivityId[]{
 const activities=enabledActivities(selected);
 // This ungraded warm-up does not change assigned answer/completion requirements.
 if(lookListenAvailable&&!activities.includes('look-listen'))activities.push('look-listen');
 return activities.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
}
export function homeworkTabs(activities:ActivityId[]):string[]{
 return [...new Set(activities.map(a=>a==='story-quiz'||a==='story-order'?'story-practice':a))];
}
export const preReaderAge=(age?:string)=>/^(?:3|4|5)(?:\D|$)/.test(age?.trim()||'');

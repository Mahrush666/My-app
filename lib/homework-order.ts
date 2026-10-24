import type {LessonVideo} from './lesson-video';
import {enabledActivities,type ActivityId} from './unit-activities';
// Preparation, recognition, reading, spelling, then the archer game.
const order:ActivityId[]=['look-listen','video','story','picture-listen','sound-picture','yes-no','cards','word-choice','word-sound','sound-word','match','reading','lesson','story-order','story-quiz','sentence-speak','spell','ward','sprint','reactor'];
export function orderHomeworkActivities(selected:ActivityId[],lookListenAvailable=false,songFirst=false):ActivityId[]{
 const activities=enabledActivities(selected);
 // This ungraded warm-up does not change assigned answer/completion requirements.
 if(lookListenAvailable&&!activities.includes('look-listen'))activities.push('look-listen');
 const rank=(a:ActivityId)=>songFirst&&a==='video'?-1:order.indexOf(a);
 return activities.sort((a,b)=>rank(a)-rank(b));
}
export function homeworkTabs(activities:ActivityId[]):string[]{
 return [...new Set(activities.map(a=>a==='story-quiz'||a==='story-order'?'story-practice':a))];
}
export const preReaderAge=(age?:string)=>/^(?:3|4|5)(?:\D|$)/.test(age?.trim()||'');

// Existing lessons identify songs and chants by title; explicit song metadata is also supported.
export const hasLessonSong=(videos?:LessonVideo[])=>Boolean(videos?.some(v=>v.kind==='song'||(v.kind!=='story'&&/\b(song|chant)\b/i.test(v.title))));

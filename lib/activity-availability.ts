import type {ActivityId} from './unit-activities';
import type {Lesson} from '../github-pages/lessons';
export function supportsActivity(activity:ActivityId,lesson:Pick<Lesson,'words'|'videos'|'story'|'readings'|'readingStory'|'sentencePractice'>&{id?:string}){
 if(activity==='spell'&&lesson.id?.startsWith('pu1-'))return lesson.id.includes('-vocabulary')&&lesson.words.length>0;
 if(activity==='story-quiz')return Boolean(lesson.readingStory?.questions.length);
 if(activity==='story-order')return Boolean(lesson.readingStory?.orders.length);
 if(activity==='sentence-speak')return Boolean(lesson.sentencePractice?.length)||lesson.words.some(w=>w.sentence?.trim().split(/\s+/).length>1);
 if(activity==='word-sound'||activity==='sound-word')return lesson.words.length>=4;
 if(activity==='video')return Boolean(lesson.videos?.length);
 if(activity==='story')return Boolean(lesson.story);
 if(activity==='reading')return lesson.readings.length>0;
 if(activity==='look-listen')return lesson.words.length>0&&lesson.words.every(w=>w.picture);
 if(activity==='sound-picture')return lesson.words.length>=4&&lesson.words.every(w=>w.picture);
 if(activity==='yes-no')return lesson.words.length>=2&&lesson.words.every(w=>w.picture&&w.action);
 return lesson.words.length>0;
}

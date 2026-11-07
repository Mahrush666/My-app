import {beehiveObjectPicture} from './beehive-art';
import type {Word} from '../app/words';
import type {IllustratedReading} from './illustrated-reading';
import type {PictureStory} from './picture-story';
import type {LessonVideo} from './lesson-video';
import type {SentencePractice} from './sentence-practice';
import {recordingPath} from './audio';
import {publicAssetPath} from './public-runtime';
import {yesNoQuestion} from './action-questions';
import {wordAudioPool} from './word-audio-choices';
import {illustrations} from './story-illustrations';
export type LessonMedia={words:Word[];readings?:{text:string}[];story?:PictureStory;readingStory?:IllustratedReading;videos?:LessonVideo[];sentencePractice?:SentencePractice[]};
export type MediaFile={src:string;kind:'image'|'audio'};
export function lessonMediaFiles(lesson:LessonMedia):MediaFile[]{
 const files=new Map<string,MediaFile>();
 const add=(path:string|undefined,kind:MediaFile['kind'])=>{if(path){const src=publicAssetPath(path);files.set(src,{src,kind})}};
 const text=(value:string)=>add(recordingPath(value),'audio');
 // These structures contain the exact picture paths and spoken choices, including hints.
 const walk=(value:unknown):void=>{
  if(typeof value==='string'){
   if(/\.(?:webp|png|jpe?g|gif|svg|avif)(?:[?#].*)?$/i.test(value))add(value,'image');
   else if(/\.(?:mp3|m4a|wav|ogg|aac|opus)(?:[?#].*)?$/i.test(value))add(value,'audio');
   else text(value);
  }else if(Array.isArray(value))value.forEach(walk);
  else if(value&&typeof value==='object')Object.values(value).forEach(walk);
 };
 walk({words:lesson.words,readings:lesson.readings,story:lesson.story,readingStory:lesson.readingStory,sentencePractice:lesson.sentencePractice});
 for(const clip of lesson.videos||[]){add(clip.poster,'image');if(clip.audioOnly)add(clip.src,'audio')}
 for(const word of lesson.words){text(yesNoQuestion(word,true,lesson.words));text(yesNoQuestion(word,false,lesson.words))}
 // Phonics distractors come from a small shared word pool, beyond this lesson's words.
 for(const word of wordAudioPool(lesson.words))text(word.en);
 for(const passage of lesson.readings||[]){const picture=illustrations.find(i=>i.text===passage.text);add(picture?.src,'image')}
 for(const q of lesson.readingStory?.questions||[]){
  const m=q.mission;if(!m)continue;
  if(m.kind==='scene'&&m.object)add(beehiveObjectPicture(m.object!),'image');
  if(m.kind==='tower')for(const animal of [...(m.stack||[]),...(m.choices||[])])add('lessons/beehive1-u4/mission-'+animal+'.webp','image');
  if(m.kind==='volcano'){
   const names=m.task==='bag'?['vinegar','baking-soda','coloring','sand']:m.task==='step'?['volcano-empty','volcano','volcano-powder','volcano-liquid','bubbles']:m.task==='monster'?['monster-body','monster-eye','monster-hands','monster-1']:[];
   for(const name of names)add('lessons/play2-u4-lesson3/art/'+name+'.webp','image');
  }
 }
 for(const name of ['street.webp','archer.png','jiangshi.png','armored-jiangshi.png'])add('game-art/lantern-street/'+name,'image');
 add('answer-sounds/correct.wav','audio');add('answer-sounds/incorrect.wav','audio');add('sounds/celebration.mp3','audio');
 // Keep the first vocabulary cards near the front of the download queue.
 return [...files.values()];
}

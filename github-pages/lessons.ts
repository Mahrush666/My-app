import {play2Unit4Lesson1} from './play2-u4-lesson1';
import {powerUp1Unit8Lesson2} from './pu1-u8-lesson2';
import {powerUp1Unit7Lesson5} from './pu1-u7-lesson5';
import {powerUp1Unit7Lesson4} from './pu1-u7-lesson4';
import {powerUp1Unit7Lesson3} from './pu1-u7-lesson3';
import {powerUp1Unit7Lesson2} from './pu1-u7-lesson2';
import {powerUp1Unit8Vocabulary} from './pu1-u8-vocabulary1';
import {smartPhonics2Unit2} from './smart-phonics2-u2';
import {smartPhonics2Unit1} from './smart-phonics2-u1';
import {powerUp1Unit9Vocabulary2} from './pu1-u9-vocabulary2';
import {powerUp1Unit9CrossCurricular} from './pu1-u9-cross-curricular';
import {powerUp1Unit9Story} from './pu1-u9-story';
import {powerUp1Unit9Vocabulary} from './pu1-u9-vocabulary1';
import {powerUp1Unit9Reading} from './pu1-u9-reading';
import type {IllustratedReading} from '../lib/illustrated-reading';
import {powerUp1Unit7Vocabulary} from './pu1-u7-vocabulary1';
import {unit8Lesson2} from './pu-starter-u8-lesson2';
import {unit8Lesson1} from './pu-starter-u8-lesson1';
import type {LessonVideo} from '../lib/lesson-video';
import {youngActivities} from '../lib/unit-activities';
import {queenOfTheRiver} from './queen-of-the-river';
import type {PictureStory} from '../lib/picture-story';
import type {ActivityId} from '../lib/unit-activities';
import { words, type Word } from '../app/words';
import { passages } from '../app/passages';
import { illustrations } from '../lib/story-illustrations';
import type { ReadingPassage } from '../lib/classroom-types';
export type Lesson = { id: string; book: string; title: string; unit?:{id:string;number:number;title:string}; lessonTitle?:string; words: Word[]; readings: ReadingPassage[]; story?:PictureStory; readingStory?:IllustratedReading; videos?:LessonVideo[]; sentencePractice?:import('../lib/sentence-practice').SentencePractice[]; defaultAge?:string; defaultActivities?:ActivityId[] };
const vocabulary = [
 ['delicious coconuts','美味的椰子','🥥','These are delicious coconuts.'],
 ['every day','每天','📅','I read every day.'],
 ['you are very nice to me','你对我很好','😊','You are very nice to me.'],
 ['invite to my house','邀请到我家','🏠','I invite you to my house.'],
 ['no problem','没问题','👍','No problem!'],
 ['king is very ill','国王病得很重','👑','The king is very ill.'],
 ['a heart','一颗心脏','❤️','The monkey has a heart.'],
 ['well','健康的','💚','The king is well now.'],
 ['go back','回去','↩️','Let us go back.'],
 ['wait here','在这里等','⏳','Please wait here.'],
 ['tricking','欺骗','🐒','You are tricking me.'],
].map(([en,zh,icon,sentence],i)=>({id:'monkey-word-'+i,en,zh,icon,sentence,category:'The monkey and the shark'}));
const actionWords: Word[] = [
 ['climb','爬','🧗'],['swim','游泳','🏊'],['walk','走','🚶'],['jump','跳','🤸'],['run','跑','🏃'],
].map(([en,zh,icon])=>({id:'pu-starter-u7-'+en,en,zh,icon,picture:'lessons/pu-starter-u7-lesson1/'+en+'.webp',category:'Free time',sentence:'I can '+en+'.'}));
export const lessons: Lesson[] = ([
 play2Unit4Lesson1,
 smartPhonics2Unit1,
 smartPhonics2Unit2,
 powerUp1Unit7Vocabulary,
 powerUp1Unit7Lesson2,
 powerUp1Unit7Lesson3,
 powerUp1Unit7Lesson4,
 powerUp1Unit7Lesson5,
 powerUp1Unit8Vocabulary,
 powerUp1Unit8Lesson2,
 powerUp1Unit9Vocabulary,
 powerUp1Unit9Reading,
 powerUp1Unit9Story,
 powerUp1Unit9Vocabulary2,
 powerUp1Unit9CrossCurricular,
 unit8Lesson1,
 unit8Lesson2,
 {id:'pu-starter-u7-lesson1',book:'Power up Starter',title:'Unit 7 · Lesson 1 · Free time',unit:{id:'pu-starter-u7',number:7,title:'Unit 7 · Free time'},lessonTitle:'Lesson 1 · Actions',words:actionWords,readings:[],videos:[{title:'Action chant',src:'lessons/pu-starter-u7-lesson1/action-chant.mp4',poster:'lessons/pu-starter-u7-lesson1/jump.webp'}],defaultActivities:['video','picture-listen']},
 {id:'pu-starter-u7-reading',book:'Power up Starter',title:'Unit 7 · Reading',unit:{id:'pu-starter-u7',number:7,title:'Unit 7 · Free time'},lessonTitle:'Reading · Queen of the River',words:[],readings:[],story:queenOfTheRiver,defaultActivities:['story']},
 ...['Animals 动物','Food 食物','My world 我的世界','Actions 动作'].map((category,i)=>({id:'starter-'+i,book:'Starter English',title:category,words:words.filter(w=>w.category===category).map(w=>({...w,id:'starter-'+w.en})),readings:[passages[Math.min(i,2)]]})),
 {id:'monkey-shark',book:'Literature · Story lessons',title:'The monkey and the shark',words:vocabulary,readings:illustrations.map((p,i)=>({id:'monkey-paragraph-'+i,title:'The monkey and the shark · '+(i+1),level:'Reading 朗读',text:p.text,hint:''}))},
] satisfies Lesson[]).map((l:Lesson)=>l.book==='Power up Starter'?{...l,defaultAge:'3–5',defaultActivities:l.defaultActivities||youngActivities}:l.book==='Power Up 1'&&l.id.includes('-vocabulary')?{...l,defaultActivities:[...new Set<ActivityId>(['spell','word-choice',...(l.defaultActivities||[]).filter(a=>!['picture-listen','sound-picture'].includes(a))])]}:l);

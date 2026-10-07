import type {LessonVideo} from '../lib/lesson-video';
import {youngActivities} from '../lib/unit-activities';
import {queenOfTheRiver} from './queen-of-the-river';
import type {PictureStory} from '../lib/picture-story';
import type {ActivityId} from '../lib/unit-activities';
import { words, type Word } from '../app/words';
import { passages } from '../app/passages';
import { illustrations } from '../lib/story-illustrations';
import type { ReadingPassage } from '../lib/classroom-types';
export type Lesson = { id: string; book: string; title: string; words: Word[]; readings: ReadingPassage[]; story?:PictureStory; videos?:LessonVideo[]; defaultAge?:string; defaultActivities?:ActivityId[] };
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
 {id:'pu-starter-u7-lesson1',book:'Power up Starter',title:'Unit 7 · Lesson 1 · Free time',words:actionWords,readings:[],videos:[{title:'Action chant',src:'lessons/pu-starter-u7-lesson1/action-chant.mp4',poster:'lessons/pu-starter-u7-lesson1/jump.webp'}],defaultActivities:['video','picture-listen','picture-speak']},
 {id:'pu-starter-u7-reading',book:'Power up Starter',title:'Unit 7 · Reading',words:[],readings:[],story:queenOfTheRiver,defaultActivities:['story']},
 ...['Animals 动物','Food 食物','My world 我的世界','Actions 动作'].map((category,i)=>({id:'starter-'+i,book:'Starter English',title:category,words:words.filter(w=>w.category===category).map(w=>({...w,id:'starter-'+w.en})),readings:[passages[Math.min(i,2)]]})),
 {id:'monkey-shark',book:'Literature · Story lessons',title:'The monkey and the shark',words:vocabulary,readings:illustrations.map((p,i)=>({id:'monkey-paragraph-'+i,title:'The monkey and the shark · '+(i+1),level:'Reading 朗读',text:p.text,hint:''}))},
] satisfies Lesson[]).map(l=>l.book==='Power up Starter'?{...l,defaultAge:'3–5',defaultActivities:l.defaultActivities||youngActivities}:l);

import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';

const art='lessons/ai-course-lesson1/';
const terms=[
 {key:'pattern',en:'pattern',zh:'规律',icon:'🔁',prompt:'Red, blue, red, blue. I see a ___.',options:['pattern','clues','examples']},
 {key:'think',en:'think',zh:'思考',icon:'💭',prompt:'Shawn can ___ before he answers.',options:['pattern','think','clues']},
 {key:'guess',en:'guess',zh:'猜',icon:'❓',prompt:'AI can ___ what comes next.',options:['examples','mistake','guess']},
 {key:'clues',en:'clues',zh:'线索',icon:'🔍',prompt:'Whiskers and a meow are ___ that it is a cat.',options:['clues','think','pattern']},
 {key:'examples',en:'examples',zh:'例子',icon:'🍎',prompt:'Red apples and green apples are both ___ of apples.',options:['guess','examples','mistake']},
 {key:'mistake',en:'mistake',zh:'错误',icon:'❌',prompt:'AI called an apple a tomato. It made a ___.',options:['think','check','mistake']},
 {key:'check',en:'check',zh:'核对',icon:'✅',prompt:'Let’s ___ the answer in the fact book.',options:['check','pattern','clues']},
];

const readingStory:IllustratedReading={
 title:'What is AI?',
 quizTitle:'Finish the sentence 补全句子',
 scenes:terms.map(({key,en})=>({id:key,image:art+key+'.webp',label:en,full:[],easy:[]})),
 questions:terms.map(({key,en,prompt,options})=>({
  id:'ai-l1-fill-'+key,scene:key,text:prompt,options,answer:options.indexOf(en),explanation:prompt.replace('___',en),
 })),
 orders:[],
};

export const aiCourseLesson1:Lesson={
 id:'ai-course-lesson1',
 book:'AI course',
 unit:{id:'ai-course-u1',number:1,title:'AI Detective Lab'},
 title:'What is AI?',
 lessonTitle:'Lesson 1 · What is AI?',
 words:terms.map(({key,en,zh,icon,prompt})=>({
  id:'ai-l1-'+key,en,zh,icon,category:'AI Detective Lab',picture:art+key+'.webp',sentence:prompt.replace('___',en),
 })),
 readings:[],
 readingStory,
 defaultAge:'6–12',
 defaultActivities:['look-listen','story-quiz'],
 allowedActivities:['look-listen','story-quiz'],
};

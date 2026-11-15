import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';

const vocabularyActivities=['look-listen','word-choice','sound-picture','story-quiz'] as const;
const art='lessons/ai-course-lesson1/';
const terms=[
 {key:'pattern',en:'pattern',zh:'规律',icon:'🔁',prompt:'Red, blue, red, blue. I see a ___.',options:['pattern','clues','examples']},
 {key:'think',en:'think',zh:'思考',icon:'💭',prompt:'Shawn can ___.',options:['pattern','think','clues']},
 {key:'guess',en:'guess',zh:'猜',icon:'❓',prompt:'AI can ___.',options:['examples','mistake','guess']},
 {key:'clues',en:'clues',zh:'线索',icon:'🔍',prompt:'There are 2 ___ that it’s a cat.',options:['clues','think','pattern']},
 {key:'examples',en:'examples',zh:'例子',icon:'🍎',prompt:'Red apples and green apples are ___ of apples.',options:['guess','examples','mistake']},
 {key:'mistake',en:'mistake',zh:'错误',icon:'❌',prompt:'AI made a ___.',options:['think','check','mistake']},
 {key:'check',en:'check',zh:'核对',icon:'✅',prompt:'Yes or no? Let’s ___.',options:['check','pattern','clues']},
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
 defaultActivities:[...vocabularyActivities],
 allowedActivities:[...vocabularyActivities],
};

import type {Lesson} from './lessons';
import readingStory from '../lib/monkey-shark-reading.json';
const entries: [string,string,string][] = [
  [
    "delicious coconuts",
    "美味的椰子",
    "These are delicious coconuts."
  ],
  [
    "every day",
    "每天",
    "I read every day."
  ],
  [
    "you are very nice to me",
    "你对我很好",
    "You are very nice to me."
  ],
  [
    "invite you to my house",
    "邀请你来我家",
    "I would like to invite you to my house."
  ],
  [
    "no problem",
    "没问题",
    "No problem!"
  ],
  [
    "king is very ill",
    "国王病得很重",
    "The king is very ill."
  ],
  [
    "a heart",
    "一颗心脏",
    "The monkey has a heart."
  ],
  [
    "well",
    "健康的",
    "The king is well now."
  ],
  [
    "go back",
    "回去",
    "Let us go back."
  ],
  [
    "wait here",
    "在这里等",
    "Please wait here."
  ],
  [
    "tricking",
    "欺骗",
    "You are tricking me."
  ]
];
export const powerUp1Unit9Reading:Lesson={
 id:'pu1-u9-reading',book:'Power Up 1',title:'Unit 9 · Reading · The Monkey and the Shark',
 unit:{id:'pu1-u9',number:9,title:'Unit 9'},lessonTitle:'Reading · The Monkey and the Shark',
 defaultAge:'6–12',defaultActivities:['word-choice','reading','story-quiz','story-order'],
 words:entries.map(([en,zh,sentence],i)=>({id:'pu1-u9-word-'+(i+1),en,zh,sentence,icon:'🐒',category:'The Monkey and the Shark',picture:'lessons/pu1-u9-reading/word-'+(i+1)+'.webp'})),
 readingStory,
 readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''})),
};

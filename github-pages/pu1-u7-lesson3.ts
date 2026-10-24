import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u7-lesson3-reading.json';
const vocabulary=[["catching", "接住", "She is catching."], ["hitting", "击打", "He’s hitting a small ball."], ["running", "跑步", "She’s running in the park."], ["skateboarding", "滑滑板", "He’s riding his skateboard."], ["throwing", "投掷", "He is throwing."], ["badminton", "羽毛球", "They’re playing badminton."], ["hockey", "曲棍球", "He’s playing hockey."], ["baseball", "棒球", "They’re playing baseball."], ["kicking", "踢", "Are they kicking? Yes, they’re kicking."]];
export const powerUp1Unit7Lesson3:Lesson={
 id:'pu1-u7-vocabulary2',book:'Power Up 1',title:'Unit 7 · Lesson 3 · Vocabulary & grammar',
 unit:{id:'pu1-u7',number:7,title:'Unit 7 · Sports and hobbies'},lessonTitle:'Lesson 3 · Vocabulary & grammar',
 defaultAge:'6–12',defaultActivities:['look-listen','video','word-choice','word-sound','sound-word','reading','story-quiz','sentence-speak','spell','reactor'],
 words:vocabulary.map(([en,zh,sentence])=>({id:'pu1-u7-l3-'+en,en,zh,sentence,icon:'',category:'Sports and actions',picture:'lessons/pu1-u7-lesson3/'+en+'.webp'})),
 readingStory,readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''})),
 sentencePractice:readingStory.scenes.flatMap(s=>s.full.map((text,i)=>({id:s.id+'-line-'+(i+1),text}))),
 videos:[{title:'Sports chant',kind:'song',src:'lessons/pu1-u7-lesson3/chant.mp4',poster:'lessons/pu1-u7-lesson3/chant-poster.webp'}]
};

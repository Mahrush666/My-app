import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u8-lesson2-reading.json';
const entries=[["ride a horse", "骑马", "I can ride a horse."], ["swim", "游泳", "I can swim."], ["dance", "跳舞", "I can dance."], ["sing", "唱歌", "I can sing."], ["look in a mirror", "照镜子", "I can look at my face in the mirror."], ["eat socks", "吃袜子", "I can eat socks."], ["use a computer", "使用电脑", "I can use a computer."], ["play the piano", "弹钢琴", "She can play the piano."], ["play badminton", "打羽毛球", "Grandpa Friendly can play badminton."]];
export const powerUp1Unit8Lesson2:Lesson={
 id:'pu1-u8-lesson2',book:'Power Up 1',title:'Unit 8 · Lesson 2 · Story & grammar',
 unit:{id:'pu1-u8',number:8,title:'Unit 8 · At home'},lessonTitle:'Lesson 2 · Story & grammar',
 defaultAge:'6–12',defaultActivities:['video','look-listen','word-choice','word-sound','sound-word','reading','story-quiz','story-order','sentence-speak','reactor'],
 words:entries.map(([en,zh,sentence])=>({id:'pu1-u8-l2-'+en.replaceAll(' ','-'),en,zh,sentence,icon:'',category:'What can you do?',picture:'lessons/pu1-u8-lesson2/'+en.replaceAll(' ','-')+'.webp'})),
 readingStory,readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''})),
 sentencePractice:[...readingStory.scenes.slice(0,6).map(s=>({id:s.id+'-sentence',text:s.full[0]})),...readingStory.scenes[6].full.map((text,i)=>({id:'pu1-u8-l2-grammar-sentence-'+i,text}))],
 videos:[{title:'Can you dance? · Rap',kind:'song',src:'lessons/pu1-u8-lesson2/rap.mp4',poster:'lessons/pu1-u8-lesson2/rap-poster.webp'},{title:'The Friendly Farm · What can you do?',kind:'story',src:'lessons/pu1-u8-lesson2/story.mp4',poster:'lessons/pu1-u8-lesson2/story-poster.webp'}]
};

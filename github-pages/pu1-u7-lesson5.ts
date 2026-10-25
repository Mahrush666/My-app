import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u7-lesson5-reading.json';
const entries=[["duck pond", "鸭池", "Amelia’s riding her bike around the duck pond."], ["hill", "小山", "Little Alfie’s running down the hill after the skateboard."], ["fall", "跌倒", "I don’t want to fall."], ["skateboard", "滑板", "He’s holding his skateboard."], ["bike", "自行车", "Amelia’s taking her bike to the park."], ["help", "帮助", "It’s good to help your friends."], ["friend", "朋友", "He’s a nice boy."], ["difficult", "困难的", "Oliver’s jumping too, but it’s very difficult!"]];
export const powerUp1Unit7Lesson5:Lesson={
 id:'pu1-u7-reading',book:'Power Up 1',title:'Unit 7 · Lesson 5 · A good friend',
 unit:{id:'pu1-u7',number:7,title:'Unit 7 · Sports and hobbies'},lessonTitle:'Lesson 5 · A good friend',
 defaultAge:'6–12',defaultActivities:['look-listen','word-choice','word-sound','sound-word','reading','story-quiz','story-order','sentence-speak','reactor'],
 words:entries.map(([en,zh,sentence])=>({id:'pu1-u7-l5-'+en.replaceAll(' ','-'),en,zh,sentence,icon:'',category:'A good friend',picture:'lessons/pu1-u7-lesson5/'+en.replaceAll(' ','-')+'.webp'})),
 readingStory,readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''})),
 sentencePractice:readingStory.scenes.map(s=>({id:s.id+'-sentence',text:s.full[0]}))
};

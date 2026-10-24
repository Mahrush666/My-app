import type {Lesson} from './lessons';
import readingStory from '../lib/friendly-farm-u7-reading.json';
const activities=[["He’s playing the guitar.", "他正在弹吉他。"], ["She’s playing the piano.", "她正在弹钢琴。"], ["She’s playing basketball.", "她正在打篮球。"], ["He’s riding a bike.", "他正在骑自行车。"], ["They’re watching television.", "他们正在看电视。"], ["She’s swimming.", "她正在游泳。"], ["He’s playing football.", "他正在踢足球。"], ["She’s playing tennis.", "她正在打网球。"]];
export const powerUp1Unit7Lesson2:Lesson={
 id:'pu1-u7-lesson2',book:'Power Up 1',title:'Unit 7 · Lesson 2 · Story & grammar',
 unit:{id:'pu1-u7',number:7,title:'Unit 7 · Sports and hobbies'},lessonTitle:'Lesson 2 · Story & grammar',
 defaultAge:'6–12',defaultActivities:['video','reading','look-listen','word-choice','sound-picture','story-quiz','story-order','sentence-speak'],
 words:activities.map(([en,zh],i)=>({id:'pu1-u7-l2-activity-'+(i+1),en,zh,icon:'',sentence:en,category:'What are you doing?',picture:'lessons/pu1-u7-lesson2/activity-'+(i+1)+'.webp'})),
 readingStory,readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''})),
 sentencePractice:readingStory.scenes.flatMap(s=>s.full.map((text,i)=>({id:s.id+'-line-'+(i+1),text}))),
 videos:[{title:'The Friendly Farm',kind:'story',src:'lessons/pu1-u7-lesson2/story.mp4',poster:'lessons/pu1-u7-lesson2/story-poster.webp'}]
};

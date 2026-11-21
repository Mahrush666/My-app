import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';
const art='lessons/play1-u5/';
const unit={id:'play1-u5',number:5,title:'Unit 5 · Fun with Friends'};
const first=[['dinosaur','恐龙'],['robot','机器人'],['board game','桌游'],['balloon','气球'],['boat','玩具船'],['train','玩具火车']];
const second=[['ball','球','Chuck'],['doll','洋娃娃','Ellie'],['blocks','积木','Chuck'],['teddy bear','泰迪熊','Ellie'],['truck','玩具卡车','Jake'],['plane','玩具飞机','Jake']];
const slug=(word:string)=>word.replace(/ /g,'-');
const noun=(word:string)=>word==='blocks'?'blocks':'a '+word;
const sentence=(word:string)=>'I have '+noun(word)+'.';
const names=['Jake','Chuck','Ellie'];
const ownership=(name:string,word:string)=>name+' has '+noun(word)+'.';
const questions:IllustratedReading['questions']=second.map(([word,,owner],i)=>({
 id:'play1-u5-l2-who-'+slug(word),scene:'friends',text:'Who has '+noun(word)+'?',
 picture:art+'friends-with-toys.webp',pictureMaxWidth:640,listenOnly:true,
 options:names.map(name=>ownership(name,word)),answer:names.indexOf(owner),explanation:ownership(owner,word),
}));
export const play1Unit5Lesson1:Lesson={
 id:'play1-u5-lesson1',book:'Play 1',title:'Unit 5 · Lesson 1 · What do you have?',unit,
 lessonTitle:'Lesson 1 · What do you have?',defaultAge:'3–5',
 defaultActivities:['look-listen','sound-picture','picture-listen'],
 allowedActivities:['look-listen','sound-picture','picture-listen','reading','sentence-speak'],
 words:first.map(([en,zh])=>({id:'play1-u5-l1-'+slug(en),en,zh,icon:'',category:'Toys 玩具',picture:art+'toys/'+slug(en)+'.webp',sentence:sentence(en),pictureListening:{question:'What do you have?',answer:sentence(en)}})),
 sentencePractice:first.map(([word])=>({id:'play1-u5-l1-say-'+slug(word),text:sentence(word),picture:art+'toys/'+slug(word)+'.webp'})),
 readings:[],readingStory:{title:'Let’s play!',scenes:[
  {id:'play',image:art+'lets-play.webp',label:'Two friends playing with toys',full:["Let’s play!",'Yeah!'],easy:["Let’s play!",'Yeah!']},
  {id:'dinosaur',image:art+'lets-play.webp',label:'A girl has a toy dinosaur',full:['What do you have?','I have a dinosaur.'],easy:['What do you have?','I have a dinosaur.']},
  {id:'robot',image:art+'lets-play.webp',label:'A boy has a toy robot',full:['What do you have?','I have a robot.'],easy:['What do you have?','I have a robot.']},
 ],questions:[],orders:[]},
};
export const play1Unit5Lesson2:Lesson={
 id:'play1-u5-lesson2',book:'Play 1',title:'Unit 5 · Lesson 2 · Who has a ball?',unit,
 lessonTitle:'Lesson 2 · Who has a ball?',defaultAge:'3–5',
 defaultActivities:['look-listen','sound-picture','reading','story-quiz'],
 allowedActivities:['look-listen','sound-picture','story-quiz','reading','sentence-speak'],
 words:second.map(([en,zh,owner])=>({id:'play1-u5-l2-'+slug(en),en,zh,icon:'',category:'More toys 更多玩具',picture:art+'toys/'+slug(en)+'.webp',sentence:ownership(owner,en)})),
 sentencePractice:second.map(([word,,owner])=>({id:'play1-u5-l2-say-'+slug(word),text:ownership(owner,word),picture:art+'friends-with-toys.webp'})),
 readings:[],readingStory:{title:'So many toys!',quizTitle:'Who has it? 谁拿着玩具？',quizInstruction:'Look, listen and choose. 看图，听一听，选答案。',scenes:[
  {id:'meet-jake',image:art+'jake.webp',label:'Jake',full:['This is Jake.','Jake has a truck.','Jake has a plane.'],easy:['This is Jake.','Jake has a truck.','Jake has a plane.']},
  {id:'meet-chuck',image:art+'chuck.webp',label:'Chuck',full:['This is Chuck.','Chuck has a ball.','Chuck has blocks.'],easy:['This is Chuck.','Chuck has a ball.','Chuck has blocks.']},
  {id:'meet-ellie',image:art+'ellie.webp',label:'Ellie',full:['This is Ellie.','Ellie has a doll.','Ellie has a teddy bear.'],easy:['This is Ellie.','Ellie has a doll.','Ellie has a teddy bear.']},
  {id:'friends',image:art+'friends-with-toys.webp',label:'Jake has a truck and a plane. Chuck has a ball and blocks. Ellie has a doll and a teddy bear.',full:['So many toys!','Who has a ball?','Chuck has a ball.','Who has a doll?','I have a doll.'],easy:['Who has a ball?','Chuck has a ball.','Who has a doll?','I have a doll.']},
 ],questions,orders:[]},
};

import originalRecordings from '../lib/pu-starter-u9-lesson4-original-audio.json';
import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';

const id='pu-starter-u9-lesson4',base=`lessons/${id}/`;
const picture=(n:number)=>base+`panel-${n}.webp`;
const panel=(n:number)=>'pu-starter-u9-l4-panel-'+n;
const animal=(name:string)=>'lessons/pu-starter-u9-lesson3/'+name+'.webp';
const dialogue:[string,string[]][]=[
 ['A hot day',["It's hot today. I'm hot!"]],
 ['Duck is missing',["Where's Duck?","I don't know."]],
 ['Looking for Duck',["Let's find him.","Is he in the forest?"]],
 ['Two hungry men',["I'm very hungry."]],
 ['The men see Duck',["Let's catch the duck."]],
 ['Duck swims away',["Come back, duck!"]],
 ['The men have Duck',["Now we've got the duck."]],
 ['Friends come to help',["Look! There's Duck.","We can help him. Let's go."]],
 ['Five friends together again',["Thank you very much!"]],
];
const faces=['happy','scared','sad'];
const feelings=(number:number,scene:number,text:string,answer:number,explanation:string):IllustratedReading['questions'][number]=>({
 id:`pu-starter-u9-l4-feeling-${number}`,scene:panel(scene),picture:picture(scene),pictureMaxWidth:600,
 text,options:['Happy.','Scared.','Sad.'],optionImages:faces.map(face=>base+face+'.svg'),answer,explanation,listenOnly:true,
});
const story:IllustratedReading={
 title:'Five good friends',recordings:originalRecordings,audio:'lesson-audio/pu-starter-u9-lesson4-original/whole-story.mp3',audioLabel:'Original story recording 故事原音',
 scenes:dialogue.map(([label,lines],i)=>({id:panel(i+1),label,image:picture(i+1),audio:'lesson-audio/pu-starter-u9-lesson4-original/picture-'+String(i+1).padStart(2,'0')+'.mp3',full:lines,easy:lines})),
 questions:[
  {id:'pu-starter-u9-l4-missing',scene:panel(2),text:'Who is missing?',options:['dog','duck','sheep'],optionImages:['dog','duck','sheep'].map(animal),answer:1,explanation:"Where's Duck?",listenOnly:true},
  {id:'pu-starter-u9-l4-forest',scene:panel(3),text:'Where do the friends look for Duck?',options:['At the farm.','In the forest.','At the pond.'],optionImages:[picture(1),picture(3),picture(5)],answer:1,explanation:'Is he in the forest?',listenOnly:true},
  {id:'pu-starter-u9-l4-chasing',scene:panel(6),text:'Which animal are the men chasing?',options:['goat','horse','duck'],optionImages:['goat','horse','duck'].map(animal),answer:2,explanation:'Come back, duck!',listenOnly:true},
  {id:'pu-starter-u9-l4-help',scene:panel(8),text:'Who helps Duck?',options:['His friends.','The men.','Duck is alone.'],optionImages:[picture(8),picture(4),picture(7)],answer:0,explanation:"We can help him. Let's go.",listenOnly:true},
  feelings(1,7,'How does Duck feel when the men have him?',1,'Scared.'),
  feelings(2,9,'How do the animals feel at the end?',0,'Happy.'),
  feelings(3,8,'How do the men feel when the friends come?',1,'Scared.'),
  {id:'pu-starter-u9-l4-thanks',scene:panel(9),picture:picture(9),pictureMaxWidth:600,text:'What does Duck say to his friends?',
   options:["I'm very hungry.",'Thank you very much!',"I don't know."],answer:1,explanation:'Thank you very much!',listenOnly:true},
 ],
 orders:[
  {id:'pu-starter-u9-l4-find-order',title:'Duck is missing · Find him',scenes:[panel(2),panel(3),panel(6)]},
  {id:'pu-starter-u9-l4-help-order',title:'Friends help Duck',scenes:[panel(7),panel(8),panel(9)]},
 ],
};
export const starterUnit9Lesson4:Lesson={
 id,book:'Power up Starter',title:'Unit 9 · Lesson 4 · Five good friends',
 unit:{id:'pu-starter-u9',number:9,title:'Unit 9 · Moving to the farm'},
 lessonTitle:'Lesson 4 · Five good friends',defaultAge:'3–5',
 defaultActivities:['reading','story-quiz','story-order'],
 allowedActivities:['reading','story-quiz','story-order','look-listen','sound-picture','picture-listen','reactor'],
 words:[['horse','马'],['goat','山羊'],['dog','狗'],['duck','鸭子'],['sheep','绵羊']].map(([en,zh])=>({
  id:'pu-starter-u9-l4-'+en,en,zh,icon:'',sentence:en,category:'Farm friends',picture:animal(en),
 })),readings:[],readingStory:story,
};

import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';
const art='lessons/act2-u9-lesson4/';
const city='lessons/act2-u9-illustrated/';
const newCity='lessons/act2-u9-lesson3/';
const panel=(n:number)=>'act2-u9-l4-panel-'+n;
const dialogue:[string,string[]][]=[
 ['Outside the school',["Jake! Where are you going?","I'm going to the farm, and you?"]],
 ['Planning the walk',["I'm going to the zoo. I'm going to see a friend.","The zoo is next to the farm. Let's go together!"]],
 ['At the supermarket',["This is the supermarket. My mom buys food here."]],
 ['At the fire station',["This is the fire station.","Look, a firefighter! Hello!","Hi!"]],
 ['At the hospital',["This is the hospital.","I don't like going to the hospital."]],
 ['Meeting friends at the zoo',["Look! The zoo. Who are you going to see?","A zookeeper and Pandy!","Hello!"]],
];
const placePicture=(place:string)=>['supermarket','fire station','zoo'].includes(place)?newCity+place.replaceAll(' ','-')+'.webp':city+place+'.webp';
const story:IllustratedReading={
 title:'A Walk Through Town',audio:'lesson-audio/act2-u9-lesson4/whole-story.mp3',audioLabel:'Listen to the whole story 听完整故事',
 scenes:dialogue.map(([label,lines],i)=>({id:panel(i+1),label,image:art+'panel-'+(i+1)+'.webp',full:lines,easy:lines})),
 questions:[
  {id:'act2-u9-l4-jake-farm',scene:panel(1),text:'Where is Jake going?',options:['farm','zoo','school'],optionImages:['farm','zoo','school'].map(placePicture),answer:0,explanation:"I'm going to the farm, and you?",listenOnly:true},
  {id:'act2-u9-l4-going-zoo',scene:panel(2),text:'Where is she going?',options:['hospital','farm','zoo'],optionImages:['hospital','farm','zoo'].map(placePicture),answer:2,explanation:"I'm going to the zoo. I'm going to see a friend.",listenOnly:true},
  {id:'act2-u9-l4-buys-food',scene:panel(3),text:"Where does Jake's mom buy food?",options:['supermarket','hospital','fire station'],optionImages:['supermarket','hospital','fire station'].map(placePicture),answer:0,explanation:'This is the supermarket. My mom buys food here.',listenOnly:true},
  {id:'act2-u9-l4-next-to',scene:panel(2),text:'The zoo is next to the...',options:['school','farm','hospital'],optionImages:['school','farm','hospital'].map(placePicture),answer:1,explanation:"The zoo is next to the farm. Let's go together!",listenOnly:true},
  {id:'act2-u9-l4-cashier',scene:panel(3),picture:placePicture('supermarket'),text:'Who works here?',options:['A firefighter.','A cashier.','A doctor.','A zookeeper.'],answer:1,explanation:'A cashier.',listenOnly:true},
  {id:'act2-u9-l4-firefighter',scene:panel(4),picture:placePicture('fire station'),text:'Who works here?',options:['A zookeeper.','A doctor.','A firefighter.','A cashier.'],answer:2,explanation:'A firefighter.',listenOnly:true},
  {id:'act2-u9-l4-doctor',scene:panel(5),picture:placePicture('hospital'),text:'Who works here?',options:['A doctor.','A firefighter.','A cashier.','A zookeeper.'],answer:0,explanation:'A doctor.',listenOnly:true},
  {id:'act2-u9-l4-friends',scene:panel(6),picture:art+'panel-6.webp',pictureMaxWidth:600,text:'Who are you going to see?',options:['A doctor.','A zookeeper and Pandy!','A firefighter.'],answer:1,explanation:'A zookeeper and Pandy!',listenOnly:true},
 ],
 orders:[
  {id:'act2-u9-l4-first-stops',title:'The first stops',scenes:[panel(1),panel(3),panel(4)]},
  {id:'act2-u9-l4-last-stops',title:'The last stops',scenes:[panel(4),panel(5),panel(6)]},
 ],
};
export const act2Unit9Lesson4:Lesson={
 id:'act2-u9-lesson4',book:'ACT2',unit:{id:'act2-u9',number:9,title:'Unit 9 · City Trip'},
 title:'Unit 9 · Lesson 4 · Story',lessonTitle:'Lesson 4 · A Walk Through Town',defaultAge:'3–5',
 defaultActivities:['reading','story-quiz','story-order'],allowedActivities:['reading','story-quiz','story-order'],
 words:['school','farm','supermarket','fire station','hospital','zoo'].map(place=>({id:'act2-u9-l4-'+place.replaceAll(' ','-'),en:place,zh:{school:'学校',farm:'农场',supermarket:'超市','fire station':'消防站',hospital:'医院',zoo:'动物园'}[place]||'',icon:'',category:'Places in the story',picture:placePicture(place),recording:['supermarket','fire station','zoo'].includes(place)?'lesson-audio/act2-u9-lesson3/'+place.replaceAll(' ','-')+'.mp3':'lesson-audio/act2-u9-enunciated/'+place+'.mp3',sentence:'This is the '+place+'.'})),
 readings:[],readingStory:story,
};

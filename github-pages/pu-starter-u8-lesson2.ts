import type {Lesson} from './lessons';
import type {Word} from '../app/words';
const actions=[
 {verb:'eat',ing:'eating',zh:'我正在吃东西。',icon:'🥕',subject:'he'},
 {verb:'clean',ing:'cleaning',zh:'我正在打扫。',icon:'🧽',subject:'he'},
 {verb:'drink',ing:'drinking',zh:'我正在喝东西。',icon:'🥤',subject:'she'},
 {verb:'sleep',ing:'sleeping',zh:'我正在睡觉。',icon:'💤',subject:'she'},
 {verb:'take a photo',ing:'taking a photo',zh:'我正在拍照。',icon:'📷',subject:'he'},
] as const;
const vocabulary:Word[]=actions.map(({verb,ing,zh,icon,subject})=>({id:'pu-starter-u8-l2-'+verb.replaceAll(' ','-'),en:'I am '+ing+'.',zh,icon,sentence:'I am '+ing+'.',category:'What are you doing?',picture:'lessons/pu-starter-u8-lesson2/'+verb.replaceAll(' ','-')+'.webp',action:{subject,ing}}));
export const unit8Lesson2:Lesson={id:'pu-starter-u8-lesson2',book:'Power up Starter',title:'Unit 8 · Lesson 2 · We’re having fun',unit:{id:'pu-starter-u8',number:8,title:'Unit 8 · We’re having fun'},lessonTitle:'Lesson 2 · Action sentences',words:vocabulary,readings:[],defaultAge:'3–5',defaultActivities:['look-listen','picture-listen','sound-picture','yes-no']};

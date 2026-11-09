import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';

const id = 'pu-starter-u9-lesson1';
const asset = (file: string) => `lessons/${id}/${file}`;

const clothes = [
  {key:'jeans', en:'jeans', zh:'牛仔裤', sentence:'I have got blue jeans.'},
  {key:'t-shirt', en:'T-shirt', zh:'T恤', sentence:'I have got an orange T-shirt.'},
  {key:'socks', en:'socks', zh:'袜子', sentence:'I have got socks.'},
  {key:'jacket', en:'jacket', zh:'夹克', sentence:'I have got a jacket.'},
  {key:'shoes', en:'shoes', zh:'鞋子', sentence:'I have got shoes.'},
];

const questions: IllustratedReading['questions'] = [
  {
    id:'pu-starter-u9-l1-blue-jeans', scene:'packing', picture:asset('jeans.webp'),
    text:'What colour are the jeans?',
    options:['I have got red jeans.','I have got blue jeans.','I have got green jeans.'],
    answer:1, explanation:'I have got blue jeans.', listenOnly:true,
  },
  {
    id:'pu-starter-u9-l1-orange-shirt', scene:'packing', picture:asset('t-shirt.webp'),
    text:'What colour is the T-shirt?',
    options:['I have got an orange T-shirt.','I have got a green T-shirt.','I have got a purple T-shirt.'],
    answer:0, explanation:'I have got an orange T-shirt.', listenOnly:true,
  },
  {
    id:'pu-starter-u9-l1-shoes-under', scene:'packing', picture:asset('chair-scene.webp'),
    text:'Where are the shoes?',
    options:['The shoes are on the chair.','The shoes are in the box.','The shoes are under the chair.'],
    answer:2, explanation:'The shoes are under the chair.', listenOnly:true,
  },
  {
    id:'pu-starter-u9-l1-socks-on', scene:'packing', picture:asset('chair-scene.webp'),
    text:'Where are the socks?',
    options:['The socks are under the chair.','The socks are on the chair.','The socks are in the box.'],
    answer:1, explanation:'The socks are on the chair.', listenOnly:true,
  },
];

export const starterUnit9Lesson1: Lesson = {
  id, book:'Power up Starter',
  title:'Unit 9 · Lesson 1 · Clothes',
  unit:{id:'pu-starter-u9', number:9, title:'Unit 9 · Moving to the farm'},
  lessonTitle:'Lesson 1 · Clothes',
  defaultAge:'3–5',
  defaultActivities:['video','look-listen','sound-picture','picture-listen','story-quiz','reactor'],
  allowedActivities:['video','look-listen','sound-picture','picture-listen','story-quiz','sentence-speak','reactor'],
  words:clothes.map(({key,en,zh,sentence})=>({
    id:`pu-starter-u9-l1-${key}`, en, zh, sentence, icon:'',
    category:'Clothes', picture:asset(key+'.webp'),
  })),
  readings:[],
  readingStory:{
    title:'Clothes and colours',
    scenes:[{id:'packing',label:'The Friendly Family packs clothes',image:asset('packing-scene.webp'),full:[],easy:[]}],
    questions, orders:[],
  },
  sentencePractice:questions.map(q=>({
    id:q.id+'-say',text:q.explanation,picture:q.picture,prompt:q.text,hideWritten:true,
  })),
  videos:[
    {title:'Moving to the farm · Warm-up',kind:'lesson',src:asset('moving-to-the-farm-review.mp4'),poster:asset('moving-to-the-farm-review-poster.webp')},
    {title:'Clothes · Listen, point and say',audioOnly:true,src:asset('listen-point-say.m4a'),poster:asset('packing-scene.webp')},
    {title:'Clothes chant',kind:'song',src:asset('clothes-chant.mp4'),poster:asset('clothes-chant-poster.webp')},
  ],
};

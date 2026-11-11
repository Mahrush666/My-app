import type {Lesson} from './lessons';

const id='pu-starter-u9-lesson2';
const asset=(file:string)=>`lessons/${id}/${file}`;
const clothes=(name:string)=>`lessons/pu-starter-u9-lesson1/${name}.webp`;
const question='What do you want?';
const items=[
 {key:'t-shirt',name:'T-shirt',zh:'我想要我的T恤。',picture:asset('yellow-t-shirt.webp')},
 {key:'socks',name:'socks',zh:'我想要我的袜子。',picture:clothes('socks')},
 {key:'jeans',name:'jeans',zh:'我想要我的牛仔裤。',picture:clothes('jeans')},
 {key:'jacket',name:'jacket',zh:'我想要我的夹克。',picture:clothes('jacket')},
 {key:'shoes',name:'shoes',zh:'我想要我的鞋子。',picture:clothes('shoes')},
 {key:'camera',name:'camera',zh:'我想要我的相机。',picture:'lessons/pu1-u9-vocabulary2/camera.webp'},
];
const words=items.map(({key,name,zh,picture})=>{
 const answer=`I want my ${name}.`;
 return {id:`pu-starter-u9-l2-${key}`,en:answer,zh,sentence:answer,picture,icon:'',
  category:'What do you want?',pictureListening:{question,answer}};
});

export const starterUnit9Lesson2:Lesson={
 id,book:'Power up Starter',title:'Unit 9 · Lesson 2 · What do you want?',
 unit:{id:'pu-starter-u9',number:9,title:'Unit 9 · Moving to the farm'},
 lessonTitle:'Lesson 2 · What do you want?',
 defaultAge:'3–5',
 defaultActivities:['video','look-listen','picture-listen','sound-picture','sentence-speak','reactor'],
 allowedActivities:['video','look-listen','picture-listen','sound-picture','sentence-speak','reactor'],
 words,readings:[],
 sentencePractice:[
  {id:'pu-starter-u9-l2-ask',text:question,picture:asset('packing-dialogue.webp'),
   prompt:'Ask me what I want.',hideWritten:true},
  ...words.map(word=>({
   id:word.id+'-say',text:word.sentence,picture:word.picture,prompt:question,hideWritten:true,
  })),
 ],
 videos:[{title:'The Friendly Family · Listen to the dialogue',kind:'lesson',audioOnly:true,
  src:asset('packing-dialogue.m4a'),poster:asset('packing-dialogue.webp')}],
};

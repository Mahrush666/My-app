import type {Lesson} from './lessons';
import type {Word} from '../app/words';
const vocabulary:Word[]=[
 ['eat','吃','🥕','I am eating.'],
 ['clean','打扫','🧽','I am cleaning.'],
 ['drink','喝','🥤','I am drinking.'],
 ['sleep','睡觉','💤','I am sleeping.'],
 ['take a photo','拍照','📷','I am taking a photo.'],
].map(([en,zh,icon,sentence])=>({id:'pu-starter-u8-'+en.replaceAll(' ','-'),en,zh,icon,sentence,category:'We are having fun',picture:'lessons/pu-starter-u8-lesson1/'+en.replaceAll(' ','-')+'.webp'}));
export const unit8Lesson1:Lesson={
 id:'pu-starter-u8-lesson1',book:'Power up Starter',title:'Unit 8 · Lesson 1 · We’re having fun',unit:{id:'pu-starter-u8',number:8,title:'Unit 8 · We’re having fun'},lessonTitle:'Lesson 1 · Actions',words:vocabulary,readings:[],
 videos:[{title:'Action chant',src:'lessons/pu-starter-u8-lesson1/action-chant.mp4',poster:'lessons/pu-starter-u8-lesson1/chant-poster.webp'}],
 defaultAge:'3–5',defaultActivities:['video','picture-listen'],
};

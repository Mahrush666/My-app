import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';
const base='lessons/smart-phonics2-u1/';
// Reading sentences are transcribed verbatim from the supplied Smart Phonics 2 pages.
const story:IllustratedReading={title:'The ram',scenes:[
 {id:'sp2-u1-cap',label:'The ram and his cap',image:base+'story-cap.webp',full:['The ram has a cap.','The ram has jam.','Oh! The ram has jam on his cap.'],easy:[]},
 {id:'sp2-u1-nap',label:'The ram and his map',image:base+'story-nap.webp',full:['The ram has a map.','The ram has a nap.','Oh! The ram has a nap on his map.'],easy:[]}
],questions:[
 {id:'sp2-u1-q1',scene:'sp2-u1-cap',text:'Who has a cap?',options:['The ram.','The cat.','The dog.'],answer:0,explanation:'The ram has a cap.'},
 {id:'sp2-u1-q2',scene:'sp2-u1-cap',text:'What is on his cap?',options:['Ham.','Jam.','A map.'],answer:1,explanation:'Oh! The ram has jam on his cap.'},
 {id:'sp2-u1-q3',scene:'sp2-u1-nap',text:'What does the ram have?',options:['A fan.','A bag.','A map.'],answer:2,explanation:'The ram has a map.'},
 {id:'sp2-u1-q4',scene:'sp2-u1-nap',text:'Where does the ram have a nap?',options:['On his map.','On his cap.','On the dam.'],answer:0,explanation:'Oh! The ram has a nap on his map.'}
],orders:[]};
const entries:[string,string,string,string][]=[['dam','水坝','🌊',''],['ham','火腿','🍖',''],['jam','果酱','🍓','The ram has jam.'],['ram','公羊','🐏','The ram has a cap.'],['cap','帽子','🧢','Oh! The ram has jam on his cap.'],['lap','大腿上（坐着时）','🪑',''],['map','地图','🗺️','The ram has a map.'],['nap','小睡','💤','The ram has a nap.']];
export const smartPhonics2Unit1:Lesson={id:'smart-phonics2-u1',book:'Smart Phonics 2',title:'Unit 1 · Short Vowel a',unit:{id:'smart-phonics2-unit1',number:1,title:'Unit 1 · Short Vowel a'},lessonTitle:'Short a · -am and -ap',defaultAge:'6–12',defaultActivities:['word-sound','sound-word','sentence-speak'],sentencePractice:story.scenes.flatMap(scene=>scene.full.map((text,i)=>({id:scene.id+'-sentence-'+i,text}))),words:entries.map(([en,zh,icon,sentence])=>({id:'sp2-u1-'+en,en,zh,icon,sentence:en,category:en.endsWith('am')?'-am':'-ap',picture:base+en+'.webp'})),readingStory:story,readings:story.scenes.map((scene,i)=>({id:scene.id,title:'The ram · '+(i+1),text:scene.full.join(' '),level:'Reading',hint:''}))};

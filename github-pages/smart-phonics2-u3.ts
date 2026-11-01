import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';
// Preserve the six sentences exactly as printed on the supplied Unit 3 story page.
const sentences=['The man goes to the bed.','The bed is red.','The hen goes to the bed.','The bed is wet.','The hen has a nap.','Oh! The hen is red!'];
const story:IllustratedReading={title:'The red bed',scenes:[{id:'sp2-u3-story',label:'The man, the hen and the red bed',image:'lessons/smart-phonics2-u3/story-page.webp',full:sentences,easy:sentences}],questions:[],orders:[]};
const entries:[string,string,string][]=[['jet','喷气式飞机','-et'],['net','网','-et'],['vet','兽医','-et'],['wet','湿的','-et'],['bed','床','-ed'],['red','红色的','-ed'],['hen','母鸡','-en'],['pen','钢笔','-en']];
export const smartPhonics2Unit3:Lesson={
 id:'smart-phonics2-u3',book:'Smart Phonics 2',title:'Unit 3 · Short Vowel e',
 unit:{id:'smart-phonics2-unit3',number:3,title:'Unit 3 · Short Vowel e'},lessonTitle:'Short e · -et, -ed and -en',defaultAge:'6–12',
 defaultActivities:['word-sound','sound-word','sentence-speak'],
 allowedActivities:['word-sound','sound-word','sentence-speak','reading','reactor'],
 words:entries.map(([en,zh,category])=>({id:'sp2-u3-'+en,en,zh,icon:'',sentence:en,category})),
 sentencePractice:sentences.map((text,i)=>({id:'sp2-u3-sentence-'+i,text})),
 readings:[{id:'sp2-u3-reading',title:'The red bed',text:sentences.join(' '),level:'Reading',hint:''}],readingStory:story
};

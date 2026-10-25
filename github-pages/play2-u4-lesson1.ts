import type {Lesson} from './lessons';
import readingStory from '../lib/play2-u4-lesson1-practice.json';
const senses=[["see", "看见", "eyes", "眼睛"], ["hear", "听见", "ears", "耳朵"], ["smell", "闻", "nose", "鼻子"], ["taste", "品尝", "mouth", "嘴巴"], ["touch", "触摸", "hands", "双手"]];
export const play2Unit4Lesson1:Lesson={
 id:'play2-u4-lesson1',book:'Play 2',title:'Unit 4 · Lesson 1 · Senses',
 unit:{id:'play2-u4',number:4,title:'Unit 4 · The Five Senses'},lessonTitle:'Lesson 1 · Senses',
 defaultAge:'6–12',defaultActivities:['look-listen','picture-listen','sound-picture','word-choice','story-quiz','sentence-speak','reactor'],
 words:senses.map(([en,zh,part])=>({id:'play2-u4-l1-'+en,en,zh,icon:'',sentence:'I can '+en+' with my '+part+'.',category:'The Five Senses',picture:'lessons/play2-u4-lesson1/'+en+'-illustrated.webp'})),
 readings:[],readingStory,
 sentencePractice:readingStory.scenes.map(s=>({id:s.id+'-sentence',text:s.full[0]}))
};

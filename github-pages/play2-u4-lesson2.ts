import type {Lesson} from './lessons';
import readingStory from '../lib/play2-u4-lesson2-practice.json';
const vocabulary=[["foot", "脚", "This is my foot."], ["arm", "手臂", "This is my arm."], ["leg", "腿", "This is my leg."], ["hand", "手", "This is my hand."], ["eye", "眼睛", "This is my eye."], ["ear", "耳朵", "This is my ear."], ["mouth", "嘴巴", "This is my mouth."], ["nose", "鼻子", "This is my nose."], ["tall", "高的", "He is tall."], ["short", "矮的", "She is short."], ["long hair", "长发", "She has long hair."], ["short hair", "短发", "She has short hair."]];
export const play2Unit4Lesson2:Lesson={
 id:'play2-u4-lesson2',book:'Play 2',title:'Unit 4 · Lesson 2 · Language in use',
 unit:{id:'play2-u4',number:4,title:'Unit 4 · The Five Senses'},lessonTitle:'Lesson 2 · Body parts & appearance',
 defaultAge:'6–12',defaultActivities:['look-listen','picture-listen','sound-picture','word-choice','word-sound','sound-word','story-quiz','sentence-speak','reactor'],
 words:vocabulary.map(([en,zh,sentence])=>({id:'play2-u4-l2-'+en.replaceAll(' ','-'),en,zh,sentence,icon:'',category:'Body parts and appearance',picture:'lessons/play2-u4-lesson2/'+en.replaceAll(' ','-')+'.webp'})),
 readings:[],readingStory,
 sentencePractice:[
 {id:'play2-u4-l2-say-tall',text:'He is tall.'},
 {id:'play2-u4-l2-say-short',text:'He is short.'},
 {id:'play2-u4-l2-say-long-hair',text:'She has long hair.'},
 {id:'play2-u4-l2-say-short-hair',text:'She has short hair.'},
 {id:'play2-u4-l2-say-arms',text:'He has long arms.'},
 {id:'play2-u4-l2-say-eyes',text:'He has big eyes.'},
 {id:'play2-u4-l2-say-hands',text:'I have two hands.'},
 {id:'play2-u4-l2-say-feel',text:'I can feel with my hands.'},
 {id:'play2-u4-l2-say-mouth',text:"I don't have a mouth. I can't eat."}
 ]
};

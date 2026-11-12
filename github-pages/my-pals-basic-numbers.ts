import type {Lesson} from './lessons';

const lessonId = 'my-pals-basic-numbers-0-10';
const category = 'Basic Numbers';
const numberWords = [
 ['zero','零'], ['one','一'], ['two','二'], ['three','三'],
 ['four','四'], ['five','五'], ['six','六'], ['seven','七'],
 ['eight','八'], ['nine','九'], ['ten','十'],
] as const;

export const myPalsBasicNumbers: Lesson = {
 id: lessonId,
 book: 'English Math — My Pals Are Here',
 title: 'Basic Numbers · 0–10',
 unit: {id:'my-pals-basic-numbers',number:1,title:category},
 lessonTitle: '0–10',
 words: numberWords.map(([en,zh],number)=>({
  id: lessonId+'-'+en,
  en,
  zh,
  icon: String(number),
  picture: 'lessons/'+lessonId+'/'+number+'.webp',
  category,
  sentence: en,
 })),
 readings: [],
 defaultActivities: ['spell'],
 allowedActivities: ['spell','look-listen'],
};

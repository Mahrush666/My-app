import type {Lesson} from './lessons';

const book = 'English Math — My Pals Are Here';
const unit = {id:'my-pals-basic-numbers',number:1,title:'Basic Numbers'};

function numberLesson(first: number, entries: ReadonlyArray<readonly [string, string]>): Lesson {
 const last = first + entries.length - 1;
 const id = `${unit.id}-${first}-${last}`;
 const lessonTitle = `${first}–${last}`;
 const introducesTeens = first === 11;

 return {
  id,
  book,
  unit,
  title: `${unit.title} · ${lessonTitle}`,
  lessonTitle,
  words: entries.map(([en,zh],index)=>{
   const number = first + index;
   const highlightedEnding = en.endsWith('teen') ? 'teen' : en === 'twenty' ? 'ty' : undefined;
   return {
    id: `${id}-${en}`,
    en,
    zh,
    icon: String(number),
    picture: `lessons/${id}/${number}.webp`,
    category: unit.title,
    sentence: en,
    highlightedEnding,
   };
  }),
  readings: [],
  defaultActivities: introducesTeens ? ['look-listen','spell'] : ['spell'],
  allowedActivities: ['spell','look-listen'],
 };
}

export const myPalsBasicNumbers = numberLesson(0,[
 ['zero','零'], ['one','一'], ['two','二'], ['three','三'],
 ['four','四'], ['five','五'], ['six','六'], ['seven','七'],
 ['eight','八'], ['nine','九'], ['ten','十'],
]);

export const myPalsTeenNumbers = numberLesson(11,[
 ['eleven','十一'], ['twelve','十二'], ['thirteen','十三'], ['fourteen','十四'],
 ['fifteen','十五'], ['sixteen','十六'], ['seventeen','十七'], ['eighteen','十八'],
 ['nineteen','十九'], ['twenty','二十'],
]);

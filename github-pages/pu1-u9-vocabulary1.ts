import type {Lesson} from './lessons';
const entries: [string,string,string,string][]=[
  [
    "boots",
    "靴子",
    "🥾",
    "I need a pair of boots."
  ],
  [
    "cap",
    "鸭舌帽",
    "🧢",
    "I need a cap."
  ],
  [
    "dress",
    "连衣裙",
    "👗",
    "I need a dress."
  ],
  [
    "glasses",
    "眼镜",
    "👓",
    "I need a pair of glasses."
  ],
  [
    "hat",
    "帽子",
    "👒",
    "I need a hat."
  ],
  [
    "jacket",
    "夹克",
    "🧥",
    "I need a jacket."
  ],
  [
    "jeans",
    "牛仔裤",
    "👖",
    "I need a pair of jeans."
  ],
  [
    "shoes",
    "鞋子",
    "👟",
    "I need a pair of shoes."
  ],
  [
    "shirt",
    "衬衫",
    "👔",
    "I need a shirt."
  ],
  [
    "skirt",
    "短裙",
    "👗",
    "I need a skirt."
  ],
  [
    "shorts",
    "短裤",
    "🩳",
    "I need a pair of shorts."
  ],
  [
    "trousers",
    "长裤",
    "👖",
    "I need a pair of trousers."
  ],
  [
    "T-shirt",
    "T恤",
    "👕",
    "I need a T-shirt."
  ]
];
export const powerUp1Unit9Vocabulary:Lesson={
 id:'pu1-u9-vocabulary1',book:'Power Up 1',title:'Unit 9 · Vocabulary 1 · Clothes',
 unit:{id:'pu1-u9',number:9,title:'Unit 9 · Happy holidays'},lessonTitle:'Vocabulary 1 · Clothes',
 defaultAge:'6–12',defaultActivities:['look-listen','sound-picture','word-choice','video'],
 words:entries.map(([en,zh,icon,sentence])=>({id:'pu1-u9-clothes-'+en.toLowerCase(),en,zh,icon,sentence,category:'Clothes',picture:'lessons/pu1-u9-vocabulary1/'+en.toLowerCase()+'.webp'})),
 readings:[],videos:[{title:'Clothes chant',src:'lessons/pu1-u9-vocabulary1/clothes-chant.mp4',poster:'lessons/pu1-u9-vocabulary1/chant-poster.webp'}]
};

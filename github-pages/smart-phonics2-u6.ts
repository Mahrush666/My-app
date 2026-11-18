import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';

const base = "lessons/smart-phonics2-u6/";
const scenes:IllustratedReading['scenes'] = [
  {
    "id": "sp2-u6-hops",
    "label": "The fox on a box and the dog on a log.",
    "image": "lessons/smart-phonics2-u6/story-hops.webp",
    "full": [
      "The fox hops on the box.",
      "She is hot.",
      "The dog hops on the log.",
      "She is hot."
    ],
    "easy": [
      "The fox hops on the box.",
      "She is hot.",
      "The dog hops on the log.",
      "She is hot."
    ]
  },
  {
    "id": "sp2-u6-mat",
    "label": "The fox and the dog sitting on a mat.",
    "image": "lessons/smart-phonics2-u6/story-mat.webp",
    "full": [
      "The fox sits on the mat.",
      "The dog sits on the mat.",
      "They are not hot."
    ],
    "easy": [
      "The fox sits on the mat.",
      "The dog sits on the mat.",
      "They are not hot."
    ]
  }
];
const sentences = scenes.flatMap(scene => scene.full);
const entries:[string,string,string][] = [
  [
    "hot",
    "热的",
    "ot"
  ],
  [
    "pot",
    "锅",
    "ot"
  ],
  [
    "box",
    "盒子",
    "ox"
  ],
  [
    "fox",
    "狐狸",
    "ox"
  ],
  [
    "cop",
    "警察",
    "op"
  ],
  [
    "hop",
    "单脚跳",
    "op"
  ],
  [
    "dog",
    "狗",
    "og"
  ],
  [
    "log",
    "原木",
    "og"
  ]
];

export const smartPhonics2Unit6:Lesson = {
 id:'smart-phonics2-u6',
 book:'Smart Phonics 2',
 title:'Unit 6 · Short Vowel o',
 unit:{id:'smart-phonics2-unit6',number:6,title:'Unit 6 · Short Vowel o'},
 lessonTitle:'Short o · -ot, -ox, -op and -og',
 defaultAge:'6–12',
 defaultActivities:['look-listen','reading','word-sound','sound-word','spell','sentence-build','sentence-speak'],
 allowedActivities:['look-listen','reading','word-sound','sound-word','spell','sentence-build','sentence-speak','sound-picture','picture-listen','reactor'],
 words:entries.map(([en,zh,family]) => ({
  id:'sp2-u6-'+en,en,zh,icon:'',sentence:en,category:'-'+family,
  picture:base+en+'.webp',highlightedEnding:family,spellingParts:[en.slice(0,-family.length),family]
 })),
 sentencePractice:sentences.map((text,i) => ({id:'sp2-u6-sentence-'+i,text})),
 readings:scenes.map(scene => ({id:scene.id,title:"The fox and the dog",text:scene.full.join(' '),level:'Reading',hint:''})),
 readingStory:{title:"The fox and the dog",scenes,questions:[],orders:[]}
};

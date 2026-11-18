import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';

const base = "lessons/smart-phonics2-u4/";
const scenes:IllustratedReading['scenes'] = [
  {
    "id": "sp2-u4-dinner",
    "label": "The kid has a bib and a rib.",
    "image": "lessons/smart-phonics2-u4/story-dinner.webp",
    "full": [
      "The kid has a bib.",
      "The kid has a rib.",
      "The ram sees the bib.",
      "The ram sees the rib."
    ],
    "easy": [
      "The kid has a bib.",
      "The kid has a rib.",
      "The ram sees the bib.",
      "The ram sees the rib."
    ]
  },
  {
    "id": "sp2-u4-wig",
    "label": "The ram has the rib, and the kid has a wig.",
    "image": "lessons/smart-phonics2-u4/story-wig.webp",
    "full": [
      "The ram has the rib.",
      "Oh, the kid has a wig!"
    ],
    "easy": [
      "The ram has the rib.",
      "Oh, the kid has a wig!"
    ]
  }
];
const sentences = scenes.flatMap(scene => scene.full);
const entries:[string,string,string][] = [
  [
    "bib",
    "围嘴",
    "ib"
  ],
  [
    "rib",
    "排骨",
    "ib"
  ],
  [
    "kid",
    "小孩",
    "id"
  ],
  [
    "lid",
    "盖子",
    "id"
  ],
  [
    "pig",
    "猪",
    "ig"
  ],
  [
    "wig",
    "假发",
    "ig"
  ],
  [
    "fin",
    "鱼鳍",
    "in"
  ],
  [
    "pin",
    "别针",
    "in"
  ]
];

export const smartPhonics2Unit4:Lesson = {
 id:'smart-phonics2-u4',
 book:'Smart Phonics 2',
 title:'Unit 4 · Short Vowel i',
 unit:{id:'smart-phonics2-unit4',number:4,title:'Unit 4 · Short Vowel i'},
 lessonTitle:'Short i · -ib, -id, -ig and -in',
 defaultAge:'6–12',
 defaultActivities:['look-listen','reading','word-sound','sound-word','spell','sentence-build','sentence-speak'],
 allowedActivities:['look-listen','reading','word-sound','sound-word','spell','sentence-build','sentence-speak','sound-picture','picture-listen','reactor'],
 words:entries.map(([en,zh,family]) => ({
  id:'sp2-u4-'+en,en,zh,icon:'',sentence:en,category:'-'+family,
  picture:base+en+'.webp',highlightedEnding:family,spellingParts:[en.slice(0,-family.length),family]
 })),
 sentencePractice:sentences.map((text,i) => ({id:'sp2-u4-sentence-'+i,text})),
 readings:scenes.map(scene => ({id:scene.id,title:"The kid and the ram",text:scene.full.join(' '),level:'Reading',hint:''})),
 readingStory:{title:"The kid and the ram",scenes,questions:[],orders:[]}
};

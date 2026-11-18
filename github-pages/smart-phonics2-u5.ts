import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';

const base = "lessons/smart-phonics2-u5/";
const scenes:IllustratedReading['scenes'] = [
  {
    "id": "sp2-u5-cats",
    "label": "Six cats resting on a mat.",
    "image": "lessons/smart-phonics2-u5/story-cats.webp",
    "full": [
      "Six cats sit on the mat.",
      "They have a nap."
    ],
    "easy": [
      "Six cats sit on the mat.",
      "They have a nap."
    ]
  },
  {
    "id": "sp2-u5-hens",
    "label": "Six hens ripping a net and running.",
    "image": "lessons/smart-phonics2-u5/story-hens.webp",
    "full": [
      "Six hens rip the net.",
      "They have a run."
    ],
    "easy": [
      "Six hens rip the net.",
      "They have a run."
    ]
  },
  {
    "id": "sp2-u5-kids",
    "label": "Six kids playing with pans.",
    "image": "lessons/smart-phonics2-u5/story-kids.webp",
    "full": [
      "Six kids hit the pans.",
      "They have fun."
    ],
    "easy": [
      "Six kids hit the pans.",
      "They have fun."
    ]
  }
];
const sentences = scenes.flatMap(scene => scene.full);
const entries:[string,string,string][] = [
  [
    "dip",
    "蘸",
    "ip"
  ],
  [
    "hip",
    "臀部",
    "ip"
  ],
  [
    "lip",
    "嘴唇",
    "ip"
  ],
  [
    "rip",
    "撕破",
    "ip"
  ],
  [
    "hit",
    "击打",
    "it"
  ],
  [
    "sit",
    "坐",
    "it"
  ],
  [
    "mix",
    "混合",
    "ix"
  ],
  [
    "six",
    "六",
    "ix"
  ]
];

export const smartPhonics2Unit5:Lesson = {
 id:'smart-phonics2-u5',
 book:'Smart Phonics 2',
 title:'Unit 5 · Short Vowel i',
 unit:{id:'smart-phonics2-unit5',number:5,title:'Unit 5 · Short Vowel i'},
 lessonTitle:'Short i · -ip, -it and -ix',
 defaultAge:'6–12',
 defaultActivities:['look-listen','reading','word-sound','sound-word','spell','sentence-build','sentence-speak'],
 allowedActivities:['look-listen','reading','word-sound','sound-word','spell','sentence-build','sentence-speak','sound-picture','picture-listen','reactor'],
 words:entries.map(([en,zh,family]) => ({
  id:'sp2-u5-'+en,en,zh,icon:'',sentence:en,category:'-'+family,
  picture:base+en+'.webp',highlightedEnding:family,spellingParts:[en.slice(0,-family.length),family]
 })),
 sentencePractice:sentences.map((text,i) => ({id:'sp2-u5-sentence-'+i,text})),
 readings:scenes.map(scene => ({id:scene.id,title:"Six cats, hens and kids",text:scene.full.join(' '),level:'Reading',hint:''})),
 readingStory:{title:"Six cats, hens and kids",scenes,questions:[],orders:[]}
};

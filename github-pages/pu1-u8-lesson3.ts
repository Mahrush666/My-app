import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u8-lesson3-reading.json';
export const powerUp1Unit8Lesson3:Lesson={
  "id": "pu1-u8-vocabulary2",
  "book": "Power Up 1",
  "title": "Unit 8 · Lesson 3 · Vocabulary & grammar",
  "unit": {
    "id": "pu1-u8",
    "number": 8,
    "title": "Unit 8 · At home"
  },
  "lessonTitle": "Lesson 3 · Vocabulary & grammar",
  "defaultAge": "6–12",
  "defaultActivities": [
    "video",
    "look-listen",
    "word-choice",
    "word-sound",
    "sound-word",
    "spell",
    "reading",
    "story-quiz",
    "sentence-speak",
    "reactor"
  ],
  "words": [
    {
      "id": "pu1-u8-l3-armchair",
      "en": "armchair",
      "zh": "扶手椅",
      "sentence": "This is an armchair.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/armchair.webp"
    },
    {
      "id": "pu1-u8-l3-clock",
      "en": "clock",
      "zh": "时钟",
      "sentence": "There’s a clock on the wall.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/clock.webp"
    },
    {
      "id": "pu1-u8-l3-floor",
      "en": "floor",
      "zh": "地板",
      "sentence": "There’s a rug on the floor.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/floor.webp"
    },
    {
      "id": "pu1-u8-l3-hall",
      "en": "hall",
      "zh": "门厅",
      "sentence": "The clock is in the hall.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/hall.webp"
    },
    {
      "id": "pu1-u8-l3-lamp",
      "en": "lamp",
      "zh": "台灯",
      "sentence": "There’s a yellow lamp.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/lamp.webp"
    },
    {
      "id": "pu1-u8-l3-painting",
      "en": "painting",
      "zh": "绘画",
      "sentence": "There’s an old painting next to the phone.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/painting.webp"
    },
    {
      "id": "pu1-u8-l3-phone",
      "en": "phone",
      "zh": "电话",
      "sentence": "This is a phone.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/phone.webp"
    },
    {
      "id": "pu1-u8-l3-rug",
      "en": "rug",
      "zh": "小地毯",
      "sentence": "There’s a rug on the floor.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/rug.webp"
    },
    {
      "id": "pu1-u8-l3-sofa",
      "en": "sofa",
      "zh": "沙发",
      "sentence": "There’s a red sofa under the window.",
      "icon": "",
      "category": "Vocabulary & grammar",
      "picture": "lessons/pu1-u8-lesson3/sofa.webp"
    }
  ],
  "sentencePractice": [
    {
      "id": "pu1-u8-l3-sentence-1",
      "text": "There’s a small rug in front of the armchair."
    },
    {
      "id": "pu1-u8-l3-sentence-2",
      "text": "There’s a lamp between the armchair and the sofa."
    },
    {
      "id": "pu1-u8-l3-sentence-3",
      "text": "There’s a clock on the wall behind the sofa."
    },
    {
      "id": "pu1-u8-l3-sentence-4",
      "text": "The phone is between the photo and the lamp in the hall."
    },
    {
      "id": "pu1-u8-l3-sentence-5",
      "text": "The duck is in front of the bath in the bathroom."
    },
    {
      "id": "pu1-u8-l3-sentence-6",
      "text": "The clock is in the kitchen. It’s between the window and the cupboard."
    },
    {
      "id": "pu1-u8-l3-sentence-7",
      "text": "The map is on the floor in front of the television in the living room."
    },
    {
      "id": "pu1-u8-l3-sentence-8",
      "text": "The lamp is behind the armchair in the living room."
    },
    {
      "id": "pu1-u8-l3-sentence-9",
      "text": "The skateboard is in the bedroom. It’s between the door and the cupboard."
    }
  ],
  "videos": [
    {
      "title": "At home · Furniture song",
      "kind": "song",
      "src": "lessons/pu1-u8-lesson3/song.mp4",
      "poster": "lessons/pu1-u8-lesson3/song-poster.webp"
    },
    {
      "title": "In front of, behind and between",
      "kind": "lesson",
      "src": "lessons/pu1-u8-lesson3/prepositions.mp4",
      "poster": "lessons/pu1-u8-lesson3/prepositions-poster.webp"
    }
  ]
,
 readingStory,
 readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''}))
};

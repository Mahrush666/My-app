import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u8-lesson4-reading.json';
export const powerUp1Unit8Lesson4:Lesson={
  "id": "pu1-u8-cross-curricular",
  "book": "Power Up 1",
  "title": "Unit 8 · Lesson 4 · Houses around the world",
  "unit": {
    "id": "pu1-u8",
    "number": 8,
    "title": "Unit 8 · At home"
  },
  "lessonTitle": "Lesson 4 · Houses around the world",
  "defaultAge": "6–12",
  "defaultActivities": [
    "look-listen",
    "video",
    "word-choice",
    "word-sound",
    "sound-word",
    "reading",
    "story-quiz",
    "sentence-speak",
    "reactor"
  ],
  "words": [
    {
      "id": "pu1-u8-l4-hut",
      "en": "hut",
      "zh": "小屋",
      "sentence": "This is a hut.",
      "icon": "",
      "category": "Houses around the world",
      "picture": "lessons/pu1-u8-lesson4/hut.webp"
    },
    {
      "id": "pu1-u8-l4-stilt-house",
      "en": "stilt-house",
      "zh": "高脚屋",
      "sentence": "This is a stilt-house.",
      "icon": "",
      "category": "Houses around the world",
      "picture": "lessons/pu1-u8-lesson4/stilt-house.webp"
    },
    {
      "id": "pu1-u8-l4-detached-house",
      "en": "detached house",
      "zh": "独立式住宅",
      "sentence": "This is a detached house.",
      "icon": "",
      "category": "Houses around the world",
      "picture": "lessons/pu1-u8-lesson4/detached-house.webp"
    },
    {
      "id": "pu1-u8-l4-ranch",
      "en": "ranch",
      "zh": "牧场",
      "sentence": "This is a ranch.",
      "icon": "",
      "category": "Houses around the world",
      "picture": "lessons/pu1-u8-lesson4/ranch.webp"
    },
    {
      "id": "pu1-u8-l4-houseboat",
      "en": "houseboat",
      "zh": "船屋",
      "sentence": "I live in a houseboat with my mum, dad and sister.",
      "icon": "",
      "category": "Houses around the world",
      "picture": "lessons/pu1-u8-lesson4/houseboat.webp"
    },
    {
      "id": "pu1-u8-l4-flats",
      "en": "flats",
      "zh": "公寓",
      "sentence": "These are flats.",
      "icon": "",
      "category": "Houses around the world",
      "picture": "lessons/pu1-u8-lesson4/flats.webp"
    },
    {
      "id": "pu1-u8-l4-treehouse",
      "en": "treehouse",
      "zh": "树屋",
      "sentence": "I’ve got a treehouse in my garden and sometimes I sleep there.",
      "icon": "",
      "category": "Houses around the world",
      "picture": "lessons/pu1-u8-lesson4/treehouse.webp"
    },
    {
      "id": "pu1-u8-l4-caravan",
      "en": "caravan",
      "zh": "旅行拖车",
      "sentence": "It moves!",
      "icon": "",
      "category": "Houses around the world",
      "picture": "lessons/pu1-u8-lesson4/caravan.webp"
    }
  ],
  "sentencePractice": [
    {
      "id": "pu1-u8-l4-sentence-1",
      "text": "I live in a houseboat with my mum, dad and sister."
    },
    {
      "id": "pu1-u8-l4-sentence-2",
      "text": "It hasn’t got a garden."
    },
    {
      "id": "pu1-u8-l4-sentence-3",
      "text": "We can play board games at my house, but we can’t skateboard or play football!"
    },
    {
      "id": "pu1-u8-l4-sentence-4",
      "text": "In the morning I can hear the birds."
    },
    {
      "id": "pu1-u8-l4-sentence-5",
      "text": "I live in Vietnam."
    },
    {
      "id": "pu1-u8-l4-sentence-6",
      "text": "I like it because we can swim and catch fish."
    },
    {
      "id": "pu1-u8-l4-sentence-7",
      "text": "I like it because we can go to different places and take our house with us."
    }
  ],
  "videos": [
    {
      "title": "Houses around the world",
      "kind": "lesson",
      "src": "lessons/pu1-u8-lesson4/houses.mp4",
      "poster": "lessons/pu1-u8-lesson4/houses-poster.webp"
    }
  ]
,
 readingStory,
 readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''}))
};

import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u2-lesson5-reading.json';
export const powerUp1Unit2Lesson5:Lesson={
  "id": "pu1-u2-reading",
  "book": "Power Up 1",
  "title": "Unit 2 · Lesson 5 · Sara’s favourite game",
  "unit": {
    "id": "pu1-u2",
    "number": 2,
    "title": "Unit 2 · All about us"
  },
  "lessonTitle": "Lesson 5 · Sara’s favourite game",
  "defaultAge": "6–12",
  "defaultActivities": [
    "reading",
    "story-quiz",
    "story-order",
    "sentence-speak",
    "reactor"
  ],
  "words": [
    {
      "id": "pu1-u2-l5-cousin",
      "en": "cousin",
      "zh": "表兄弟姐妹",
      "sentence": "Today my cousin Sara is here too.",
      "picture": "lessons/pu1-u2-lesson5/scene-1.webp",
      "icon": "",
      "category": "Sara’s favourite game"
    },
    {
      "id": "pu1-u2-l5-hide",
      "en": "hide",
      "zh": "躲藏",
      "sentence": "Sara hides.",
      "picture": "lessons/pu1-u2-lesson5/scene-3.webp",
      "icon": "",
      "category": "Sara’s favourite game"
    },
    {
      "id": "pu1-u2-l5-count",
      "en": "count",
      "zh": "数数",
      "sentence": "I count to ten.",
      "picture": "lessons/pu1-u2-lesson5/scene-2.webp",
      "icon": "",
      "category": "Sara’s favourite game"
    },
    {
      "id": "pu1-u2-l5-cupboard",
      "en": "cupboard",
      "zh": "橱柜",
      "sentence": "Is she in the cupboard?",
      "picture": "lessons/pu1-u2-lesson5/scene-3.webp",
      "icon": "",
      "category": "Sara’s favourite game"
    },
    {
      "id": "pu1-u2-l5-bookcase",
      "en": "bookcase",
      "zh": "书柜",
      "sentence": "Is she next to the bookcase?",
      "picture": "lessons/pu1-u2-lesson5/scene-4.webp",
      "icon": "",
      "category": "Sara’s favourite game"
    },
    {
      "id": "pu1-u2-l5-crayons",
      "en": "crayons",
      "zh": "蜡笔",
      "sentence": "Grandma sees Sara’s crayons on the table.",
      "picture": "lessons/pu1-u2-lesson5/scene-6.webp",
      "icon": "",
      "category": "Sara’s favourite game"
    }
  ],
  "videos": [],
  "sentencePractice": [
    {
      "id": "pu1-u2-l5-sentence-1",
      "text": "Where are you?",
      "picture": "lessons/pu1-u2-lesson5/scene-2.webp"
    },
    {
      "id": "pu1-u2-l5-sentence-2",
      "text": "Is she in the cupboard?",
      "picture": "lessons/pu1-u2-lesson5/scene-3.webp"
    },
    {
      "id": "pu1-u2-l5-sentence-3",
      "text": "No, she isn’t.",
      "picture": "lessons/pu1-u2-lesson5/scene-3.webp"
    },
    {
      "id": "pu1-u2-l5-sentence-4",
      "text": "Is she next to the bookcase?",
      "picture": "lessons/pu1-u2-lesson5/scene-4.webp"
    },
    {
      "id": "pu1-u2-l5-sentence-5",
      "text": "Is she in the garden?",
      "picture": "lessons/pu1-u2-lesson5/scene-5.webp"
    },
    {
      "id": "pu1-u2-l5-sentence-6",
      "text": "Is she under the table?",
      "picture": "lessons/pu1-u2-lesson5/scene-6.webp"
    },
    {
      "id": "pu1-u2-l5-sentence-7",
      "text": "Yes, she is.",
      "picture": "lessons/pu1-u2-lesson5/scene-6.webp"
    }
  ]
,
 readingStory,
 readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''}))
};

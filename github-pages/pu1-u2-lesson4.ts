import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u2-lesson4-reading.json';
export const powerUp1Unit2Lesson4:Lesson={
  "id": "pu1-u2-cross-curricular",
  "book": "Power Up 1",
  "title": "Unit 2 · Lesson 4 · Using our senses",
  "unit": {
    "id": "pu1-u2",
    "number": 2,
    "title": "Unit 2 · All about us"
  },
  "lessonTitle": "Lesson 4 · Using our senses",
  "defaultAge": "6–12",
  "defaultActivities": [
    "video",
    "look-listen",
    "word-choice",
    "reading",
    "story-quiz",
    "sentence-speak",
    "reactor"
  ],
  "words": [
    {
      "id": "pu1-u2-l4-see",
      "en": "see",
      "zh": "看见",
      "sentence": "I use my eyes to see.",
      "picture": "lessons/pu1-u2-lesson4/see.webp",
      "icon": "",
      "category": "Using our senses"
    },
    {
      "id": "pu1-u2-l4-hear",
      "en": "hear",
      "zh": "听见",
      "sentence": "I use my ears to hear.",
      "picture": "lessons/pu1-u2-lesson4/hear.webp",
      "icon": "",
      "category": "Using our senses"
    },
    {
      "id": "pu1-u2-l4-smell",
      "en": "smell",
      "zh": "闻",
      "sentence": "I use my nose to smell.",
      "picture": "lessons/pu1-u2-lesson4/smell.webp",
      "icon": "",
      "category": "Using our senses"
    },
    {
      "id": "pu1-u2-l4-taste",
      "en": "taste",
      "zh": "尝",
      "sentence": "I use my tongue to taste.",
      "picture": "lessons/pu1-u2-lesson4/taste.webp",
      "icon": "",
      "category": "Using our senses"
    },
    {
      "id": "pu1-u2-l4-touch",
      "en": "touch",
      "zh": "触摸",
      "sentence": "I use my hands to touch.",
      "picture": "lessons/pu1-u2-lesson4/touch.webp",
      "icon": "",
      "category": "Using our senses"
    }
  ],
  "videos": [
    {
      "title": "Using our senses",
      "kind": "lesson",
      "src": "lessons/pu1-u2-lesson4/senses.mp4",
      "poster": "lessons/pu1-u2-lesson4/senses-poster.webp"
    }
  ],
  "sentencePractice": [
    {
      "id": "pu1-u2-l4-sentence-1",
      "text": "I use my eyes to see.",
      "picture": "lessons/pu1-u2-lesson4/see.webp"
    },
    {
      "id": "pu1-u2-l4-sentence-2",
      "text": "I use my ears to hear.",
      "picture": "lessons/pu1-u2-lesson4/hear.webp"
    },
    {
      "id": "pu1-u2-l4-sentence-3",
      "text": "I use my nose to smell.",
      "picture": "lessons/pu1-u2-lesson4/smell.webp"
    },
    {
      "id": "pu1-u2-l4-sentence-4",
      "text": "I use my tongue to taste.",
      "picture": "lessons/pu1-u2-lesson4/taste.webp"
    },
    {
      "id": "pu1-u2-l4-sentence-5",
      "text": "I use my hands to touch.",
      "picture": "lessons/pu1-u2-lesson4/touch.webp"
    },
    {
      "id": "pu1-u2-l4-sentence-6",
      "text": "I have five senses.",
      "picture": "lessons/pu1-u2-lesson4/helping-blind-people.webp"
    }
  ]
,
 readingStory,
 readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''}))
};

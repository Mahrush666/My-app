import type {Lesson} from './lessons';
import readingStory from '../lib/holiday-postcards-reading.json';
export const powerUp1Unit9CrossCurricular:Lesson={
  "id": "pu1-u9-cross-curricular",
  "book": "Power Up 1",
  "title": "Unit 9 · Cross-curricular · Landscapes and postcards",
  "unit": {
    "id": "pu1-u9",
    "number": 9,
    "title": "Unit 9 · Happy holidays"
  },
  "lessonTitle": "Cross-curricular · Landscapes and postcards",
  "defaultAge": "6–12",
  "defaultActivities": [
    "word-choice",
    "reading",
    "story-quiz"
  ],
  "words": [
    {
      "id": "pu1-u9-cross-curricular-beach",
      "en": "beach",
      "zh": "海滩",
      "icon": "🏖️",
      "sentence": "We can see shells at the beach.",
      "category": "Landscapes",
      "picture": "lessons/pu1-u9-cross-curricular/beach.webp"
    },
    {
      "id": "pu1-u9-cross-curricular-forest",
      "en": "forest",
      "zh": "森林",
      "icon": "🏖️",
      "sentence": "We can see trees in the forest.",
      "category": "Landscapes",
      "picture": "lessons/pu1-u9-cross-curricular/forest.webp"
    },
    {
      "id": "pu1-u9-cross-curricular-mountains",
      "en": "mountains",
      "zh": "山脉",
      "icon": "🏖️",
      "sentence": "We can see snow on the mountains.",
      "category": "Landscapes",
      "picture": "lessons/pu1-u9-cross-curricular/mountains.webp"
    },
    {
      "id": "pu1-u9-cross-curricular-river",
      "en": "river",
      "zh": "河流",
      "icon": "🏖️",
      "sentence": "We can see fish in the river.",
      "category": "Landscapes",
      "picture": "lessons/pu1-u9-cross-curricular/river.webp"
    }
  ],
  readingStory, readings: readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(" "),level:"Reading",hint:""})),
  videos: []
};

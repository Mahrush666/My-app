import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u8-lesson5-reading.json';
export const powerUp1Unit8Lesson5:Lesson={
  "id": "pu1-u8-reading",
  "book": "Power Up 1",
  "title": "Unit 8 · Lesson 5 · The clock on the wall",
  "unit": {
    "id": "pu1-u8",
    "number": 8,
    "title": "Unit 8 · At home"
  },
  "lessonTitle": "Lesson 5 · The clock on the wall",
  "defaultAge": "6–12",
  "defaultActivities": [
    "look-listen",
    "word-choice",
    "word-sound",
    "sound-word",
    "reading",
    "story-quiz",
    "story-order",
    "sentence-speak",
    "reactor"
  ],
  "words": [
    {
      "id": "pu1-u8-l5-ball",
      "en": "ball",
      "zh": "球",
      "sentence": "Rob wants to play with the ball.",
      "icon": "",
      "category": "The clock on the wall",
      "picture": "lessons/pu1-u8-lesson5/ball.webp"
    },
    {
      "id": "pu1-u8-l5-clock",
      "en": "clock",
      "zh": "时钟",
      "sentence": "The ball hits the clock.",
      "icon": "",
      "category": "The clock on the wall",
      "picture": "lessons/pu1-u8-lesson5/clock.webp"
    },
    {
      "id": "pu1-u8-l5-mat",
      "en": "mat",
      "zh": "地垫",
      "sentence": "The clock hits the mat on the floor.",
      "icon": "",
      "category": "The clock on the wall",
      "picture": "lessons/pu1-u8-lesson5/mat.webp"
    },
    {
      "id": "pu1-u8-l5-table",
      "en": "table",
      "zh": "桌子",
      "sentence": "The ball is on the table.",
      "icon": "",
      "category": "The clock on the wall",
      "picture": "lessons/pu1-u8-lesson5/table.webp"
    },
    {
      "id": "pu1-u8-l5-chair",
      "en": "chair",
      "zh": "椅子",
      "sentence": "This is a chair.",
      "icon": "",
      "category": "The clock on the wall",
      "picture": "lessons/pu1-u8-lesson5/chair.webp"
    },
    {
      "id": "pu1-u8-l5-sofa",
      "en": "sofa",
      "zh": "沙发",
      "sentence": "The ball is on the sofa.",
      "icon": "",
      "category": "The clock on the wall",
      "picture": "lessons/pu1-u8-lesson3/sofa.webp"
    },
    {
      "id": "pu1-u8-l5-window",
      "en": "window",
      "zh": "窗户",
      "sentence": "The ball can hit the window.",
      "icon": "",
      "category": "The clock on the wall",
      "picture": "lessons/pu1-u8-lesson5/window.webp"
    },
    {
      "id": "pu1-u8-l5-bounce",
      "en": "bounce",
      "zh": "弹起",
      "sentence": "We can catch it and bounce it and kick it and run.",
      "icon": "",
      "category": "The clock on the wall",
      "picture": "lessons/pu1-u8-lesson5/bounce.webp"
    }
  ],
  "sentencePractice": [
    {
      "id": "pu1-u8-l5-sentence-1",
      "text": "You can throw it to me, I can throw it to you."
    },
    {
      "id": "pu1-u8-l5-sentence-2",
      "text": "We can catch it and bounce it and kick it and run,"
    },
    {
      "id": "pu1-u8-l5-sentence-3",
      "text": "In the bath, on the sofa, on the table and the chair, Rob throws the ball here, Sue runs for it there."
    },
    {
      "id": "pu1-u8-l5-sentence-4",
      "text": "She picks up the clock, and says, ‘Today’s a good day.’"
    },
    {
      "id": "pu1-u8-l5-sentence-5",
      "text": "And she points to the clock and says, ‘Rob, it’s OK!’"
    }
  ],
  "videos": []
,
 readingStory,
 readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''}))
};

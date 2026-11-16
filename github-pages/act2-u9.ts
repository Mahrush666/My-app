import type { Lesson } from './lessons';

const unit = { id: 'act2-u9', number: 9, title: 'Unit 9 · City Trip' };
const art = 'lessons/act2-u9-illustrated/';
const audioRoot = 'lesson-audio/act2-u9-enunciated/';
const activities = ['video', 'look-listen', 'sound-picture', 'picture-listen'] as const;

const destinations = [
  { place: 'airport', placeZh: '机场', person: 'pilot', personZh: '飞行员' },
  { place: 'farm', placeZh: '农场', person: 'farmer', personZh: '农民' },
  { place: 'school', placeZh: '学校', person: 'teacher', personZh: '老师' },
  { place: 'hospital', placeZh: '医院', person: 'doctor', personZh: '医生' },
];

function cityTripLesson(
  number: 1 | 2,
  question: string,
  words: Lesson['words'],
  examples: { label: string; poster: string; audio: string }[],
): Lesson {
  return {
    id: 'act2-u9-lesson' + number,
    book: 'ACT2',
    unit,
    title: 'Unit 9 · Lesson ' + number + ' · ' + question,
    lessonTitle: 'Lesson ' + number + ' · ' + question,
    defaultAge: '3–5',
    defaultActivities: [...activities],
    allowedActivities: [...activities],
    words,
    readings: [],
    videos: examples.map(({label, poster, audio}) => ({
      title: label,
      kind: 'lesson',
      audioOnly: true,
      poster: art + poster + '.webp',
      src: audioRoot + audio + '.mp3',
    })),
  };
}

const whereQuestion = 'Where are you going?';
const whoQuestion = 'Who are you going to see?';

export const act2Unit9Lessons = [
  cityTripLesson(1, whereQuestion, destinations.map(({place, placeZh}) => {
    const picture = art + place + '.webp';
    const sentence = 'I’m going to the ' + place + '.';
    return {
      id: 'act2-u9-l1-' + place,
      en: place,
      recording: audioRoot + place + '.mp3',
      zh: placeZh,
      icon: '',
      category: 'City places',
      picture,
      sentence,
      pictureListening: { question: whereQuestion, answer: sentence, image: picture },
    };
  }), [
    { label: 'Going to the farm', poster: 'farm-dialogue', audio: 'dialogue-farm' },
  ]),
  cityTripLesson(2, whoQuestion, destinations.map(({place, person, personZh}) => {
    const answer = 'A ' + person + '.';
    return {
      id: 'act2-u9-l2-' + person,
      en: person,
      zh: personZh,
      icon: '',
      category: 'People in town',
      picture: art + person + '.webp',
      sentence: answer,
      pictureListening: { question: whoQuestion, answer, image: art + place + '.webp' },
    };
  }), [
    { label: 'Seeing a pilot', poster: 'pilot-dialogue', audio: 'dialogue-pilot' },
    { label: 'Seeing a teacher', poster: 'teacher-dialogue', audio: 'dialogue-teacher' },
  ]),
];

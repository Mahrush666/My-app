import type { IllustratedReading } from '../lib/illustrated-reading';
import type { Lesson } from './lessons';

const asset = (name: string) => `lessons/act3-u7-lesson4/${name}.webp`;
const panel = (number: number) => `act3-u7-l4-panel-${number}`;
const buy = (item: string) => `Can I buy a ${item}?`;
const which = 'Which one do you want?';
const withAnimal = (animal: string) => `The one with the ${animal}.`;

const dialogue: [string, string[]][] = [
  ['Grandma and the children outside the shop', ['Do you want to go shopping?', "Let's go!"]],
  ['The children see lunchboxes in the shop', ["What's this?", "It's a lunchbox."]],
  ['The shopkeeper shows them a hat', ["What's that?", "It's a hat."]],
  ['The children ask to buy something', [buy('lunchbox'), buy('T-shirt'), 'Sure!']],
  ['The shopkeeper asks them to choose', [which]],
  ['The girl chooses a panda T-shirt', [withAnimal('panda')]],
  ['The boy chooses a monkey lunchbox', [withAnimal('monkey')]],
  ['Grandma asks for balloons and a hat', ['Can I buy three balloons and one hat?']],
  ['The shopkeeper hands over their shopping', ['Here you are!']],
  ['Outside the shop, Grandma explains who the little hat is for', ['Grandma, is it your hat?', "It's small.", "It's for your baby brother."]],
];

const items = [
  { id: 'lunchbox', en: 'lunchbox', zh: '午餐盒', picture: 'lunchbox-monkey' },
  { id: 't-shirt', en: 'T-shirt', zh: 'T恤', picture: 'shirt-panda' },
  { id: 'hat', en: 'hat', zh: '帽子', picture: 'hat' },
  { id: 'balloon', en: 'balloon', zh: '气球', picture: 'balloon' },
];

const animals = ['panda', 'monkey', 'tiger'];
const questions: IllustratedReading['questions'] = [
  ...items.map((item, index) => {
    const options = [items[(index + 3) % 4], items[(index + 1) % 4], item];
    if (index % 2 === 0) options.reverse();
    return {
      id: `act3-u7-l4-buy-${item.id}`,
      scene: panel(4),
      picture: asset(item.picture),
      text: 'Look at the picture. What can you ask?',
      options: options.map(option => buy(option.en)),
      answer: options.indexOf(item),
      explanation: buy(item.en),
      listenOnly: true,
    };
  }),
  ...([
    ['shirt', 'panda', ['monkey', 'panda', 'tiger']],
    ['lunchbox', 'monkey', ['monkey', 'tiger', 'panda']],
    ['shirt', 'tiger', ['panda', 'monkey', 'tiger']],
    ['lunchbox', 'panda', ['tiger', 'panda', 'monkey']],
  ] as const).map(([item, animal, choices], index) => ({
    id: `act3-u7-l4-choose-${index + 1}`,
    scene: panel(5),
    text: `${which} ${withAnimal(animal)}`,
    options: choices.map(withAnimal),
    optionImages: choices.map(choice => asset(`${item}-${choice}`)),
    answer: choices.findIndex(choice => choice === animal),
    explanation: withAnimal(animal),
    listenOnly: true,
  })),
];

const readingStory: IllustratedReading = {
  title: 'Going shopping',
  scenes: dialogue.map(([label, lines], index) => ({
    id: panel(index + 1),
    label,
    image: asset(`panel-${String(index + 1).padStart(2, '0')}`),
    full: lines,
    easy: lines,
  })),
  questions,
  rounds: [
    { id: 'buy', title: 'Can I buy a…? 我可以买一个……吗？', questionIds: questions.slice(0, 4).map(q => q.id) },
    { id: 'choose', title: 'Which one do you want? 你想要哪一个？', questionIds: questions.slice(4).map(q => q.id) },
  ],
  orders: [],
};

export const act3Unit7Lesson4: Lesson = {
  id: 'act3-u7-lesson4',
  book: 'ACT3',
  title: 'Unit 7 · Lesson 4 · Story',
  lessonTitle: 'Lesson 4 · Story',
  unit: { id: 'act3-u7', number: 7, title: 'Unit 7 · Animals' },
  defaultAge: '6–12',
  defaultActivities: ['reading', 'look-listen', 'story-quiz', 'sentence-speak'],
  allowedActivities: ['reading', 'look-listen', 'picture-listen', 'sound-picture', 'story-quiz', 'sentence-speak'],
  words: items.map(item => ({
    id: `act3-u7-l4-${item.id}`, en: item.en, zh: item.zh, icon: '',
    picture: asset(item.picture), sentence: buy(item.en), category: 'At the shop',
  })),
  readings: [],
  readingStory,
  sentencePractice: [
    ...items.map(item => ({
      id: `act3-u7-l4-say-${item.id}`, text: buy(item.en), picture: asset(item.picture),
      prompt: 'Ask to buy this.', starter: 'Can I buy a…?',
    })),
    { id: 'act3-u7-l4-say-which', text: which, picture: asset('panel-05'), prompt: 'Ask the shopper which one they want.' },
    ...animals.map(animal => ({
      id: `act3-u7-l4-say-${animal}`, text: withAnimal(animal), picture: asset(`shirt-${animal}`),
      prompt: which, starter: 'The one with the…',
    })),
  ],
};

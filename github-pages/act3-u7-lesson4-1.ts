import type { IllustratedReading } from '../lib/illustrated-reading';
import type { Lesson } from './lessons';

const art = (name: string) => `lessons/act3-u7-lesson4-1/${name}.webp`;
const shop = (name: string) => `lessons/act3-u7-lesson4/${name}.webp`;
const buy = (item: string) => `Can I buy a ${item}?`;

const products = [
  { id: 'lunchbox', name: 'lunchbox', zh: '午餐盒', image: shop('lunchbox-monkey') },
  { id: 'hat', name: 'hat', zh: '帽子', image: shop('hat') },
  { id: 't-shirt', name: 'T-shirt', zh: 'T恤', image: shop('shirt-panda') },
  { id: 'balloon', name: 'balloon', zh: '气球', image: shop('balloon') },
];
const replies = [
  { id: 'sure', en: 'Sure!', zh: '当然可以！' },
  { id: 'here-you-are', en: 'Here you are!', zh: '给你！' },
  { id: 'thank-you', en: 'Thank you!', zh: '谢谢！' },
];
const handover = 'Sure! Here you are! Thank you!';
const scenes = products.map((product, i) => ({
  id: `shop-customer-${i + 1}`,
  image: art(`customer-${i + 1}`),
  label: `Customer ${i + 1} at the shop counter`,
  full: [buy(product.name), ...replies.map(reply => reply.en)],
  easy: [buy(product.name)],
}));

const readingStory: IllustratedReading = {
  title: 'Cashier game',
  scenes,
  orders: [],
  questions: products.map((product, i) => {
    // Keep each item's position stable during retries, but move it between rounds.
    const choices = [0, 3, 1, 2].map(offset => products[(offset + i * 2) % products.length]);
    return {
      id: `act3-u7-l4-1-order-${product.id}`,
      scene: scenes[i].id,
      text: buy(product.name),
      options: choices.map(choice => choice.name),
      optionImages: choices.map(choice => choice.image),
      answer: choices.indexOf(product),
      explanation: handover,
      cashier: true,
    };
  }),
};

export const act3Unit7Lesson41: Lesson = {
  id: 'act3-u7-lesson4-1',
  book: 'ACT3',
  title: 'Unit 7 · Lesson 4.1 · At the shop',
  lessonTitle: 'Lesson 4.1 · At the shop',
  unit: { id: 'act3-u7', number: 7, title: 'Unit 7 · Animals' },
  defaultAge: '6–12',
  defaultActivities: ['look-listen', 'sound-picture', 'story-quiz'],
  allowedActivities: ['look-listen', 'sound-picture', 'story-quiz'],
  words: [
    ...products.map(product => ({
      id: `act3-u7-l4-1-buy-${product.id}`, en: buy(product.name), zh: `我可以买一个${product.zh}吗？`,
      icon: '', picture: product.image, sentence: buy(product.name), category: 'Ask to buy',
    })),
    ...replies.map(reply => ({
      id: `act3-u7-l4-1-${reply.id}`, en: reply.en, zh: reply.zh,
      icon: '', picture: art(reply.id), sentence: reply.en, category: 'At the counter',
    })),
  ],
  readings: [],
  readingStory,
};

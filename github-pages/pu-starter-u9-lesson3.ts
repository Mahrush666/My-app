import type {Lesson} from './lessons';
import type {IllustratedReading} from '../lib/illustrated-reading';

const id='pu-starter-u9-lesson3';
const asset=(name:string)=>`lessons/${id}/${name}.webp`;
// Book page 94, Vocabulary 2: these are picture labels, not animal counts.
const animals=[
 {en:'horse',zh:'马',number:'one'},
 {en:'goat',zh:'山羊',number:'two'},
 {en:'dog',zh:'狗',number:'three'},
 {en:'duck',zh:'鸭子',number:'four'},
 {en:'sheep',zh:'绵羊',number:'five'},
];
const questions:IllustratedReading['questions']=animals.map((animal,i)=>{
 const options=[animal,...animals.filter(a=>a!==animal).slice(0,3)];
 // Vary the correct answer position while keeping each picture and label together.
 const rotated=[...options.slice(i%4),...options.slice(0,i%4)];
 return {
  id:`pu-starter-u9-l3-number-${i+1}`,scene:'farm',
  text:`Which animal is number ${animal.number}?`,
  picture:asset('book-page'),pictureMaxWidth:540,listenOnly:true,
  options:rotated.map(a=>a.en),optionImages:rotated.map(a=>asset(a.en)),
  answer:rotated.findIndex(a=>a.en===animal.en),
  explanation:animal.en,
 };
});
export const starterUnit9Lesson3:Lesson={
 id,book:'Power up Starter',title:'Unit 9 · Lesson 3 · Farm animals',
 unit:{id:'pu-starter-u9',number:9,title:'Unit 9 · Moving to the farm'},
 lessonTitle:'Lesson 3 · Farm animals',defaultAge:'3–5',
 defaultActivities:['look-listen','sound-picture','picture-listen','story-quiz','reactor'],
 allowedActivities:['look-listen','sound-picture','picture-listen','story-quiz','reactor','word-choice','word-sound','sound-word'],
 words:animals.map(animal=>({id:`pu-starter-u9-l3-${animal.en}`,en:animal.en,zh:animal.zh,
  icon:'',sentence:animal.en,category:'Farm animals',picture:asset(animal.en),
 })),readings:[],
 readingStory:{title:'Farm animals · Numbers 1–5',quizTitle:'Farm numbers 农场编号',
  quizInstruction:'Listen to the number. Find it on the farm picture, then choose the animal. 听编号，在农场图片中找到对应的动物。',
  scenes:[{id:'farm',label:'Farm animals · Book page 94',image:asset('book-page'),full:[],easy:[]}],
  questions,orders:[],
 },
};

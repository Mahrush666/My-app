import type {Lesson} from './lessons';
import type {Word} from '../app/words';
// Power Up 1, Unit 7, Vocabulary 1 (page 83). Examples are supplementary practice.
const vocabulary:Word[]=[
 ["play the guitar", "弹吉他", "🎸", "I can play the guitar."],
 ["play the piano", "弹钢琴", "🎹", "I can play the piano."],
 ["play tennis", "打网球", "🎾", "I can play tennis."],
 ["play football", "踢足球", "⚽", "I can play football."],
 ["ride a bike", "骑自行车", "🚲", "I can ride a bike."],
 ["swim", "游泳", "🏊", "I can swim."],
 ["play basketball", "打篮球", "🏀", "I can play basketball."],
 ["watch television", "看电视", "📺", "I can watch television."]
].map(([en,zh,icon,sentence])=>({id:'pu1-u7-'+en.replaceAll(' ','-'),en,zh,icon,sentence,category:'Sports and hobbies',picture:'lessons/pu1-u7-vocabulary1/'+en.replaceAll(' ','-')+'.svg'}));
export const powerUp1Unit7Vocabulary:Lesson={
 id:'pu1-u7-vocabulary1',book:'Power Up 1',title:'Unit 7 · Vocabulary 1 · Sports and hobbies',
 unit:{id:'pu1-u7',number:7,title:'Unit 7 · Sports and hobbies'},lessonTitle:'Vocabulary 1 · Sports and hobbies',
 words:vocabulary,readings:[],defaultAge:'6–12',
 defaultActivities:['look-listen','picture-listen','sound-picture','word-choice'],
};

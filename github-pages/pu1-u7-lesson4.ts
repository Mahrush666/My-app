import type {Lesson} from './lessons';
import readingStory from '../lib/pu1-u7-lesson4-reading.json';
const vocabulary=[["stretch your arms", "伸展手臂", "Let’s stretch our arms."], ["stretch your legs", "伸展双腿", "Stretch your legs."], ["stretch your body", "伸展身体", "Stretch your body."], ["run", "跑", "Run."], ["jump", "跳", "Jump."], ["bones", "骨骼", "Vitamin D is important for your bones."], ["muscles", "肌肉", "Running, playing football, riding a bike and dancing help make your bones and muscles strong."], ["strong", "强壮的", "Look, I’m strong."], ["healthy", "健康的", "I’m healthy."], ["sun cream", "防晒霜", "Remember to use sun cream when you are in the sun!"], ["drink water", "喝水", "It’s important to drink a lot of water."]];
export const powerUp1Unit7Lesson4:Lesson={
 id:'pu1-u7-cross-curricular',book:'Power Up 1',title:'Unit 7 · Lesson 4 · Look after your body',
 unit:{id:'pu1-u7',number:7,title:'Unit 7 · Sports and hobbies'},lessonTitle:'Lesson 4 · Look after your body',
 defaultAge:'6–12',defaultActivities:['look-listen','video','word-choice','word-sound','sound-word','reading','story-quiz','sentence-speak','reactor'],
 words:vocabulary.map(([en,zh,sentence])=>({id:'pu1-u7-l4-'+en.replaceAll(' ','-'),en,zh,sentence,icon:'',category:'Look after your body',picture:'lessons/pu1-u7-lesson4/'+en.replaceAll(' ','-')+'.webp'})),
 readingStory,readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''})),
 sentencePractice:readingStory.scenes.flatMap(s=>s.full.map((text,i)=>({id:s.id+'-line-'+(i+1),text}))),
 videos:[{title:'Warm-up workout',kind:'lesson',src:'lessons/pu1-u7-lesson4/warm-up.mp4',poster:'lessons/pu1-u7-lesson4/poster.webp'}]
};

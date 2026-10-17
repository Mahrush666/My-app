import type {Lesson} from './lessons';
import readingStory from '../lib/barn-story-reading.json';
const commands:[string,string][]=[
  [
    "Clean these desks, please.",
    "请擦干净这些课桌。"
  ],
  [
    "Pick up those trousers, please.",
    "请捡起那些裤子。"
  ],
  [
    "Pick up that jacket, please.",
    "请捡起那件夹克。"
  ],
  [
    "Put the ball in that cupboard, please.",
    "请把球放进那个柜子里。"
  ],
  [
    "Put these bananas on that table, please.",
    "请把这些香蕉放到那张桌子上。"
  ],
  [
    "Take this book to the bookcase, please.",
    "请把这本书拿到书架那里。"
  ]
];
export const powerUp1Unit9Story:Lesson={
 id:'pu1-u9-story',book:'Power Up 1',title:'Unit 9 · Story & grammar · Tidy up the barn',
 unit:{id:'pu1-u9',number:9,title:'Unit 9 · Happy holidays'},lessonTitle:'Story & grammar · Tidy up the barn',
 defaultAge:'6–12',defaultActivities:['video','reading','sound-picture','story-quiz'],
 words:commands.map(([en,zh],i)=>({id:'pu1-u9-command-'+(i+1),en,zh,icon:'🧹',sentence:en,category:'Instructions',picture:'lessons/pu1-u9-story/command-'+(i+1)+'.webp'})),
 readingStory,readings:readingStory.scenes.map(s=>({id:s.id,title:s.label,text:s.full.join(' '),level:'Reading',hint:''})),
 videos:[{title:'Tidy up the barn',kind:'story',src:'lessons/pu1-u9-story/barn-story.mp4',poster:'lessons/pu1-u9-story/scene-1.webp'}]
};

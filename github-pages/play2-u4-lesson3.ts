import type {Lesson} from './lessons';
import type {IllustratedReading,ReadingMission} from '../lib/illustrated-reading';
import sourceScenes from '../lib/play2-u4-volcano-story.json';
const asset=(name:string)=>'lessons/play2-u4-lesson3/art/'+name+'.webp';
const materialNames=['vinegar','baking soda','red coloring','sand'];
const materialImages=['vinegar','baking-soda','coloring','sand'].map(asset);
const stepImages=['build','add-powder','pour','bubbles'].map(asset);
const stepAnswers=['Make a volcano.','Put baking soda inside the bottle.','Pour a little vinegar.','Look at the red bubbles.'];
const questions:IllustratedReading['questions']=[];
function question(id:string,scene:string,text:string,options:string[],answer:number,mission:ReadingMission,explanation=options[answer]){questions.push({id,scene,text,options,answer,mission,explanation})}
for(let i=0;i<4;i++)question('volcano-pack-'+i,'volcano-page-3','We need '+(i===0?'some ':'')+materialNames[i]+'. Choose it for our tray.',materialNames,i,{kind:'volcano',task:'bag',step:i,object:materialImages[i],choices:materialImages,model:['We need some vinegar. Listen, then choose the green-topped bottle.','This is baking soda. Choose the blue box of white powder.','This is red coloring. Choose the small red bottle.','This is sand. Choose the bowl of sand.'][i]});
question('volcano-look','volcano-page-5','How does the baking soda look?',["It's white.","It's red.","It's blue.","It's green."],0,{kind:'volcano',task:'describe',object:asset('white-powder')});
question('volcano-smell','volcano-page-3','How does the vinegar smell?',['It smells nice.','It smells bad.','It feels hard.','It looks blue.'],1,{kind:'volcano',task:'describe',object:asset('smell-bad')});
question('volcano-feel','volcano-page-8','How does the sand feel?',['It feels hard.','It feels cold.','It feels soft.','It feels hot.'],2,{kind:'volcano',task:'describe',object:asset('feel-soft')});
question('volcano-hear','volcano-page-13','I can hear bubbles! Which sense do I use?',['I use my eyes.','I use my hands.','I use my nose.','I use my ears.'],3,{kind:'volcano',task:'sense',choices:['eyes','hands','nose','ears'].map(asset),object:asset('bubbles')});
const directions=['First, make a volcano with the sand and bottle.','Now put baking soda inside the bottle.','Pour a little vinegar into the volcano.','Choose the picture of the red bubbles.'];
for(let i=0;i<4;i++)question('volcano-step-'+i,'volcano-page-'+[7,9,10,13][i],directions[i],stepAnswers,i,{kind:'volcano',task:'step',step:i,object:stepImages[i],choices:stepImages,model:i===0?'First, make the volcano. Next, put in baking soda. Then, pour a little vinegar. Look at the bubbles!':undefined});
export const play2VolcanoStory:IllustratedReading={title:'The Five Senses: Volcano Adventure',scenes:sourceScenes,questions,orders:[],rounds:[{id:'pack',title:'1 · Pack the scientist’s bag 装好实验包',questionIds:questions.slice(0,4).map(q=>q.id)},{id:'senses',title:'2 · Senses detective 感官侦探',questionIds:questions.slice(4,8).map(q=>q.id)},{id:'volcano',title:'3 · Make the volcano 火山冒险',questionIds:questions.slice(8).map(q=>q.id)}]};
// Worksheet vocabulary supplements the original story without rewriting its pages.
const volcanoVocabulary:[string,string,string,string,string][]=[
 ['volcano','火山','Make a volcano.','volcano','Science words'],
 ['experiment','实验','Here is a fun experiment!','experiment','Science words'],
 ['vinegar','醋','We need some vinegar.','vinegar','Science words'],
 ['baking soda','小苏打',"It's white.",'baking-soda','Science words'],
 ['powder','粉末',"It's a powder, it's white.",'white-powder','Science words'],
 ['sand','沙子','It feels like sand!','sand','Science words'],
 ['red coloring','红色色素','We need some red coloring.','coloring','Science words'],
 ['soap','肥皂；洗手液','This is soap.','soap','Science words'],
 ['bubbles','泡泡','I can see red bubbles.','bubbles','Science words'],
 ['soft','柔软的',"It's soft!",'feel-soft','How does it feel or smell?'],
 ['sticky','黏的',"It's a little sticky.",'sticky','How does it feel or smell?'],
 ['stink','发臭','It stinks!','smell-bad','How does it feel or smell?'],
 ['see','看见','I can see red bubbles!','eyes','The five senses'],
 ['hear','听见','I can hear bubbles!','ears','The five senses'],
 ['smell','闻','It smells bad!','nose','The five senses'],
 ['feel','感觉；触摸','I can feel the sand.','hands','The five senses'],
 ['taste','尝','I cannot taste our volcano.','mouth','The five senses'],
 ['pour','倒','Pour a little vinegar.','pour','Experiment actions'],
 ['mix','混合；搅拌','Mix the vinegar and the red coloring.','mix','Experiment actions']
];
export const play2Unit4Lesson3:Lesson={id:'play2-u4-lesson3',book:'Play 2',title:'Unit 4 · Lesson 3 · Volcano adventure',unit:{id:'play2-u4',number:4,title:'Unit 4 · The Five Senses'},lessonTitle:'Lesson 3 · Volcano adventure',defaultAge:'6–12',defaultActivities:['look-listen','reading','story-quiz','reactor'],allowedActivities:['look-listen','picture-listen','sound-picture','reading','story-quiz','sentence-speak','reactor'],words:volcanoVocabulary.map(([en,zh,sentence,picture,category])=>({id:'play2-u4-l3-'+en.replaceAll(' ','-'),en,zh,sentence,icon:'',category,picture:asset(picture)})),readings:[],readingStory:play2VolcanoStory,sentencePractice:[
{id:'play2-u4-l3-say-vinegar',text:'We need some vinegar.',picture:asset('vinegar'),prompt:'What do we need?',starter:'We need'},
{id:'play2-u4-l3-say-white',text:"It's white.",picture:asset('white-powder'),prompt:'How does it look?',starter:"It's"},
{id:'play2-u4-l3-say-soft',text:"It's soft!",picture:asset('feel-soft'),prompt:'How does the sand feel?',starter:"It's"},
{id:'play2-u4-l3-say-smell',text:'It smells bad!',picture:asset('smell-bad'),prompt:'How does the vinegar smell?',starter:'It smells'},
{id:'play2-u4-l3-say-see',text:'I can see red bubbles!',picture:asset('bubbles'),prompt:'What can you see?',starter:'I can see'},
{id:'play2-u4-l3-say-hear',text:'I can hear bubbles!',picture:asset('bubbles'),prompt:'What can you hear?',starter:'I can hear'}]};
const monsterOptions=['monster-1','monster-2','monster-3','monster-4'].map(asset);
const monsterQuestions:IllustratedReading['questions']=[
{id:'monster-eye',scene:'monster-one',text:'My monster has one big eye. Choose the eye.',options:['One eye.','Two eyes.','Three eyes.','Four eyes.'],answer:0,explanation:'It has one big eye.',mission:{kind:'volcano',task:'monster',step:0,choices:[1,2,3,4].map(n=>asset('eyes-'+n)),model:'Listen to each description and choose a part. We will build a funny monster.'}},
{id:'monster-hands',scene:'monster-one',text:'My monster has four hands. Choose the hands.',options:['Two hands.','Four hands.','One hand.','Three hands.'],answer:1,explanation:'It has four hands.',mission:{kind:'volcano',task:'monster',step:1,choices:[2,4,1,3].map(n=>asset('hands-'+n))}},
{id:'monster-mouth',scene:'monster-one',text:'My monster has one big mouth. Choose the mouth.',options:['Eyes.','A nose.','A mouth.','Ears.'],answer:2,explanation:'It has one big mouth.',mission:{kind:'volcano',task:'monster',step:2,choices:['eyes','nose','mouth','ears'].map(asset)}},
{id:'monster-finish',scene:'monster-one',text:'Choose our monster. It has one big eye and four hands.',options:['The blue monster.','The green monster.','The orange monster.','The purple monster.'],answer:3,explanation:'Our purple monster has one big eye and four hands!',mission:{kind:'volcano',task:'monster',step:3,choices:[monsterOptions[3],monsterOptions[1],monsterOptions[2],monsterOptions[0]]}}
];
export const play2Unit4MonsterWorkshop:Lesson={id:'play2-u4-lesson3-1',book:'Play 2',title:'Unit 4 · Lesson 3.1 · Silly monster workshop',unit:{id:'play2-u4',number:4,title:'Unit 4 · The Five Senses'},lessonTitle:'Lesson 3.1 · Silly monster workshop',defaultAge:'6–12',defaultActivities:['look-listen','story-quiz'],allowedActivities:['look-listen','story-quiz','sentence-speak','picture-listen','sound-picture','reactor'],words:[['one','It has one big eye and four hands.','它有一只大眼睛和四只手。'],['two','It has two eyes and one small nose.','它有两只眼睛和一个小鼻子。'],['three','It has two eyes and many teeth.','它有两只眼睛和许多牙齿。'],['four','It has three eyes and two hands.','它有三只眼睛和两只手。']].map(([id,en,zh],i)=>({id:'play2-u4-l31-'+id,en,zh,icon:'',sentence:en,picture:monsterOptions[i],category:'Silly monsters',pictureListening:{question:'Which sentence describes this monster?',answer:en}})),readings:[],readingStory:{title:'Build a silly monster',scenes:[{id:'monster-one',label:'A purple monster with one big eye and four hands',image:monsterOptions[0],full:['It has one big eye and four hands.'],easy:[]}],questions:monsterQuestions,orders:[]},sentencePractice:[{id:'play2-u4-l31-say-eye',text:'It has one big eye.',picture:monsterOptions[0],prompt:'What does your monster have?',starter:'It has'},{id:'play2-u4-l31-say-hands',text:'It has four hands.',picture:monsterOptions[0],prompt:'What does your monster have?',starter:'It has'},{id:'play2-u4-l31-say-nose',text:'It has one small nose.',picture:monsterOptions[1],prompt:'What does your monster have?',starter:'It has'}]};

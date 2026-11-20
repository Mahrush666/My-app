import type {Lesson} from './lessons';
const groups=[
 {vowel:'a',words:[['cat','猫'],['hat','帽子'],['map','地图'],['bag','包'],['jam','果酱']]},
 {vowel:'e',words:[['bed','床'],['hen','母鸡'],['net','网'],['pen','钢笔'],['red','红色']]},
 {vowel:'i',words:[['pig','猪'],['pin','别针'],['sit','坐'],['fin','鱼鳍'],['lip','嘴唇']]},
 {vowel:'o',words:[['dog','狗'],['log','原木'],['pot','锅'],['hot','热的'],['top','顶部']]},
 {vowel:'u',words:[['sun','太阳'],['bus','公交车'],['cup','杯子'],['mug','马克杯'],['run','跑']]},
];
export const act3Unit7Lesson5:Lesson={
 id:'act3-u7-lesson5',book:'ACT3',title:'Unit 7 · Lesson 5 · CVC reading',
 unit:{id:'act3-u7',number:7,title:'Unit 7 · Animals'},lessonTitle:'Lesson 5 · CVC reading · a, e, i, o, u',
 defaultAge:'6–12',defaultActivities:['sound-word','spell'],allowedActivities:['sound-word','word-sound','spell'],
 words:groups.flatMap(group=>group.words.map(([en,zh])=>({id:'act3-u7-l5-'+en,en,zh,icon:'',category:'Short '+group.vowel+' · CVC',sentence:en}))),readings:[],
};

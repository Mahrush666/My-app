import type {Lesson} from './lessons';
const cards=[
 ['He’s throwing a basketball.','他在扔篮球。'],['She’s catching a basketball.','她在接篮球。'],['They’re playing badminton.','他们在打羽毛球。'],['He’s riding his skateboard.','他在玩滑板。'],
 ['He’s playing hockey.','他在打曲棍球。'],['He’s hitting a baseball.','他在击打棒球。'],['She’s running.','她在跑步。'],['They’re playing football.','他们在踢足球。'],
 ['Stretch your body.','伸展身体。'],['Stretch your legs.','伸展双腿。'],['Jump!','跳！'],['Stretch your arms.','伸展双臂。'],
 ['She’s riding a horse.','她在骑马。'],['They’re playing basketball.','她们在打篮球。'],['They’re playing baseball.','他们在打棒球。'],['They’re running.','他们在跑步。'],
];
export const sportsActionsDungeon:Lesson={id:'sports-actions-dungeon',book:'Games',title:'Sports & Actions Dungeon',unit:{id:'games-sports-actions',number:1,title:'Sports & actions'},lessonTitle:'Sports & Actions Dungeon',defaultAge:'6–12',defaultActivities:['dungeon'],allowedActivities:['dungeon','look-listen','sound-picture','picture-listen','word-choice'],words:cards.map(([en,zh],i)=>({id:'dungeon-sports-'+i,en,zh,sentence:en,category:'Sports & actions',icon:'',picture:'games/dungeon/sports/'+String(i).padStart(2,'0')+'.webp'})),readings:[]};

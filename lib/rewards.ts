export const homeworkXP=10;
export const rewardTiers=[{name:'Explorer',min:0,icon:'🌱'},{name:'Bronze',min:200,icon:'🛡️'},{name:'Silver',min:450,icon:'🥈'},{name:'Gold',min:750,icon:'🏆'},{name:'Diamond',min:1100,icon:'💎'}];
export const rewardBadges=[
 {id:'alphabet',name:'Alphabet Master',icon:'🔤',xp:50,description:'Recognize all English letters.'},
 {id:'phonics',name:'Phonics Explorer',icon:'📖',xp:50,description:'Blend 20 CVC words.'},
 {id:'story',name:'Storyteller',icon:'🎤',xp:60,description:'Retell a short story.'},
 {id:'memory',name:'Memory Master',icon:'🧠',xp:40,description:'Recall words after a delay.'},
 {id:'speaker',name:'Conversation Hero',icon:'💬',xp:60,description:'Complete a speaking challenge with your teacher.'},
 {id:'team',name:'Team Player',icon:'🤝',xp:30,description:'Help complete a team challenge.'}
];
export type RewardEntry={id:string;kind:string;source:string;label:string;xp:number;created_at:number;revoked:number};
export type RewardState={xp:number;diamond:boolean;badges:string[];history:RewardEntry[]};
export const rewardTier=(xp:number,diamond:boolean)=>rewardTiers.reduce((current,t)=>xp>=t.min&&(t.name!=='Diamond'||diamond)?t:current,rewardTiers[0]);
export function rewardSummary(history:RewardEntry[]):RewardState{const active=history.filter(h=>!h.revoked);return {xp:active.reduce((n,h)=>n+Number(h.xp),0),diamond:active.some(h=>h.kind==='diamond'),badges:active.filter(h=>h.kind==='badge').map(h=>h.source.slice(6)),history};}

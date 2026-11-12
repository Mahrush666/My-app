import type {BadgeTrack,DiamondChallenge,RewardSemester} from './reward-program';
export const homeworkXP=10;
export const attendanceXP=10;
export const rewardTiers=[{name:'Explorer',min:0,icon:'🌱'},{name:'Bronze',min:200,icon:'🛡️'},{name:'Silver',min:450,icon:'🥈'},{name:'Gold',min:750,icon:'🏆'},{name:'Diamond',min:1100,icon:'💎'}];
export const rewardBadges=[
 {id:'alphabet',name:'Alphabet Master',icon:'🔤',xp:50,description:'Recognize all English letters.'},
 {id:'phonics',name:'Phonics Explorer',icon:'📖',xp:50,description:'Blend 20 CVC words.'},
 {id:'story',name:'Storyteller',icon:'🎤',xp:60,description:'Retell a short story.'},
 {id:'memory',name:'Memory Master',icon:'🧠',xp:40,description:'Recall words after a delay.'},
 {id:'speaker',name:'Conversation Hero',icon:'💬',xp:60,description:'Complete a speaking challenge with your teacher.'},
 {id:'team',name:'Team Player',icon:'🤝',xp:30,description:'Help complete a team challenge.'}
];
const trackBadges={
 kinders:[['sounds','Sound Explorer','🔤',50,'Say the sounds of 10 taught letters in two lessons.'],['words','Word Builder','🧩',50,'Blend and read 10 taught CVC words.'],['story','Picture Storyteller','📚',60,'Tell a three-part story from pictures.'],['remember','Word Rememberer','🧠',40,'Recall eight taught words a week later.'],['speaker','Brave Speaker','💬',60,'Ask and answer three familiar questions.'],['team','Helpful Partner','🤝',30,'Take turns and help a partner in three lessons.']],
 achievers:[['reader','Story Detective','🔎',50,'Read a short story and answer who, where, and why questions.'],['writer','Sentence Builder','✏️',50,'Write and revise five connected sentences.'],['story','Story Reteller','🎤',60,'Retell a story in your own words.'],['nature','Nature Observer','🌿',40,'Record and compare three observations.'],['math','Math Explainer','🔢',60,'Explain two familiar problems in English.'],['team','Team Contributor','🤝',30,'Help another student explain an idea in three lessons.']],
 advancers:[['reader','Evidence Finder','📖',50,'Answer three questions and point to evidence in the text.'],['writer','Thoughtful Writer','✍️',50,'Write and revise a paragraph with supporting details.'],['presenter','Discovery Presenter','🧭',60,'Present for two minutes and answer two questions.'],['science','Scientific Thinker','🔬',40,'Predict, observe, and explain a conclusion.'],['reason','Reasoned Speaker','💡',60,'Support an opinion and respond to another view.'],['mentor','Supportive Mentor','🤝',30,'Help a peer learn a skill over three sessions.']],
} satisfies Record<Exclude<BadgeTrack,'general'>,[string,string,string,number,string][]>;
export function badgesForTrack(track:BadgeTrack='general'){
 if(track==='general')return rewardBadges;
 return trackBadges[track].map(([key,name,icon,xp,description])=>({id:track+'_'+key,name,icon,xp,description}));
}
export const allRewardBadges=[...rewardBadges,...badgesForTrack('kinders'),...badgesForTrack('achievers'),...badgesForTrack('advancers')];
export type RewardEntry={id:string;kind:string;source:string;label:string;xp:number;created_at:number;revoked:number;breakdown?:Record<string,number>;note?:string};
export type RewardState={xp:number;diamond:boolean;badges:string[];history:RewardEntry[];lifetimeXP?:number;semester?:RewardSemester;track?:BadgeTrack;challenge?:DiamondChallenge};
export const rewardTier=(xp:number,diamond:boolean)=>rewardTiers.reduce((current,t)=>xp>=t.min&&(t.name!=='Diamond'||diamond)?t:current,rewardTiers[0]);
export function rewardSummary(history:RewardEntry[]):RewardState{const active=history.filter(h=>!h.revoked);return {xp:active.reduce((n,h)=>n+Number(h.xp),0),diamond:active.some(h=>h.kind==='diamond'),badges:active.filter(h=>h.kind==='badge').map(h=>h.source.slice(6)),history};}

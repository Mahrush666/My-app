export const lessonHomeworkStatuses=['not-assigned','missing','partial','completed'] as const;
export const lessonParticipation=['none','good','excellent'] as const;
export type LessonReward={
 homework:typeof lessonHomeworkStatuses[number];
 participation:typeof lessonParticipation[number];
 extra:number;
 note:string;
};
export const emptyLessonReward:LessonReward={homework:'not-assigned',participation:'none',extra:0,note:''};
export type LessonRates={attendance:number;homework:number};
export type RewardRule={effective:string;target:number;rates:Record<string,LessonRates>};
export type RewardSemester={name:string;start:string};
export type BadgeTrack='general'|'kinders'|'achievers'|'advancers';
export type DiamondChallenge={title:string;description:string;category:string;assignedAt:number};
export type RewardProgram={semesters:RewardSemester[];rules:RewardRule[];tracks:Record<string,BadgeTrack>};
export const emptyRewardProgram:RewardProgram={semesters:[],rules:[],tracks:{}};
export function lessonRewardPoints(reward:LessonReward,rates:LessonRates,present:boolean){
 return {
  attendance:present?rates.attendance:0,
  homework:reward.homework==='completed'?rates.homework:reward.homework==='partial'?Math.floor(rates.homework/2):0,
  participation:present?(reward.participation==='excellent'?10:reward.participation==='good'?5:0):0,
  extra:reward.extra,
 };
}
export function weeklyRates(ids:string[],target:number){
 const points=(step:number)=>Math.floor(step*target/(ids.length*2));
 return Object.fromEntries(ids.map((id,i)=>[id,{attendance:points(2*i+1)-points(2*i),homework:points(2*i+2)-points(2*i+1)}]));
}

export const diamondIdeas:Record<BadgeTrack,{title:string;category:string;description:string}[]>={
 general:[{title:'My English project',category:'Project',description:'Make a small poster about a topic you love and tell your teacher about it.'}],
 kinders:[{title:'My picture story',category:'Speaking',description:'Draw three pictures and use them to tell your own story in English.'}],
 achievers:[{title:'Nature journal',category:'Project',description:'Make three observations over one week and explain what changed.'}],
 advancers:[{title:'Discovery presentation',category:'Project',description:'Research a topic and present your findings. Answer two questions from your audience.'}],
};

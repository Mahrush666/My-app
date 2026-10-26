export function chinaWeek(now:number){
 const local=new Date(now+8*3600000), day=local.getUTCDay()||7;
 const start=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()-day+1)-8*3600000;
 return {start,end:start+7*86400000};
}
export type StudentDashboardData={dailyEnabled?:boolean;nextClass:{day:string;time:string;duration:number}|null;weeklyXP:number;classmates:{name:string;xp:number;me:boolean}[];weekStart:string};

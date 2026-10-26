export type ActiveInterval={start:number;end:number};
export type HomeworkTime={activeSeconds:number;sessions:number}|null;
export class ActiveHomeworkClock{
 private last:number;private action:number;private foreground=true;private intervals:ActiveInterval[]=[];
 constructor(now:number,private idleMs=60000){this.last=this.action=now}
 private advance(now:number){const end=Math.min(now,this.action+this.idleMs);if(this.foreground&&end>this.last){const previous=this.intervals.at(-1);if(previous?.end===this.last)previous.end=end;else this.intervals.push({start:this.last,end})}this.last=now}
 activity(now:number){this.advance(now);this.action=now}
 setForeground(active:boolean,now:number){this.advance(now);this.foreground=active;if(active)this.action=now}
 flush(now:number){this.advance(now);const intervals=this.intervals;this.intervals=[];return intervals}
}
export function homeworkTime(rows:{session_id:string;started_at:number;ended_at:number}[]):HomeworkTime{
 if(!rows.length)return null;const sorted=rows.map(r=>({start:Number(r.started_at),end:Number(r.ended_at)})).filter(r=>r.end>r.start).sort((a,b)=>a.start-b.start);let total=0,end=0;
 for(const r of sorted){total+=Math.max(0,r.end-Math.max(end,r.start));end=Math.max(end,r.end)}
 return {activeSeconds:Math.floor(total/1000),sessions:new Set(rows.filter(r=>Number(r.ended_at)>Number(r.started_at)).map(r=>r.session_id)).size};
}
export function formatHomeworkTime(seconds:number){const minutes=Math.floor(seconds/60),rest=Math.floor(seconds%60);return minutes>=60?`${Math.floor(minutes/60)}h ${minutes%60}m ${rest}s`:`${minutes}m ${rest}s`}

export type ReactorEnemyKind='hopper'|'armored'|'boss';
const previousArrowInterval=0.5/0.9;
// Recover the original rate over the first three completed word challenges.
export function reactorArrowInterval(level:number){
 const rate=0.8+0.2*Math.max(0,Math.min(3,level-1))/3;
 return previousArrowInterval/rate;
}
// Armored enemies replace regular spawns, keeping the crowd size unchanged.
export function reactorEnemyKind(time:number,id:number):ReactorEnemyKind{
 return time>=25&&(id+1)%5===0?'armored':'hopper';
}
export function reactorEnemyStats(kind:ReactorEnemyKind,time:number){
 const growth=Math.floor(time/40),speed=34+time*0.22;
 if(kind==='boss')return {hp:32,speed:27,size:82,shotRadius:30,contactRadius:43,score:40};
 if(kind==='armored')return {hp:4+growth*2,speed:speed*0.65,size:58,shotRadius:18,contactRadius:30,score:5};
 return {hp:1+growth,speed,size:46,shotRadius:14,contactRadius:25,score:2};
}

import {shuffle} from './random';
export function spellingGaps(text:string,stage:number,order:number[],useParts=false):number[]{
 const n=order.length;
 if(useParts&&stage===2&&n===2)return order.slice(1);
 const counts=useParts?[n,1,Math.min(2,n-1),n,n]:[n,Math.min(2,n),Math.min(n,Math.max(3,Math.ceil(n*.5))),Math.min(n,Math.max(4,Math.ceil(n*.75))),n];
 return order.slice(0,counts[Math.max(0,Math.min(4,stage))]).sort((a,b)=>a-b);
}
export function spellingOrder(text:string,parts?:readonly string[]):number[]{
 return shuffle(parts?parts.map((_,index)=>index):[...text].flatMap((letter,i)=>/[a-z]/i.test(letter)?[i]:[]));
}
export function spellingTiles(text:string,gaps:number[],parts?:readonly string[]){
 const tiles=gaps.map(index=>({id:index,letter:parts?.[index]??text[index]}));
 const mixed=shuffle(tiles);
 // Avoid presenting the solution already in order (except identical letters).
 if(mixed.length>1&&mixed.every((t,i)=>t.letter===tiles[i].letter)){
  const different=mixed.findIndex(t=>t.letter!==mixed[0].letter);
  if(different>0)[mixed[0],mixed[different]]=[mixed[different],mixed[0]];
 }
 return mixed;
}

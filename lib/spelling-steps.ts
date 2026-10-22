import {shuffle} from './random';
export function spellingGaps(text:string,stage:number,order:number[]):number[]{
 const n=order.length;
 const counts=[n,Math.min(2,n),Math.min(n,Math.max(3,Math.ceil(n*.5))),Math.min(n,Math.max(4,Math.ceil(n*.75))),n];
 return order.slice(0,counts[Math.max(0,Math.min(4,stage))]).sort((a,b)=>a-b);
}
export function spellingOrder(text:string):number[]{return shuffle([...text].flatMap((letter,i)=>/[a-z]/i.test(letter)?[i]:[]));}
export function spellingTiles(text:string,gaps:number[]){
 const tiles=gaps.map(index=>({id:index,letter:text[index]}));
 const mixed=shuffle(tiles);
 // Avoid presenting the solution already in order (except identical letters).
 if(mixed.length>1&&mixed.every((t,i)=>t.letter===tiles[i].letter)){
  const different=mixed.findIndex(t=>t.letter!==mixed[0].letter);
  if(different>0)[mixed[0],mixed[different]]=[mixed[different],mixed[0]];
 }
 return mixed;
}

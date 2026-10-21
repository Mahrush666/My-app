import type {Word} from '../app/words';
import {audioKey,audioSource} from './audio';
import {shuffle} from './random';
import {smartPhonics2Unit1} from '../github-pages/smart-phonics2-u1';
import {smartPhonics2Unit2} from '../github-pages/smart-phonics2-u2';

// Avoid minimal pairs (one letter changed, added or removed) in beginner choices.
export function similarReadingWords(first:string,second:string):boolean{
 const a=audioKey(first),b=audioKey(second);
 if(Math.abs(a.length-b.length)>1)return false;
 let previous=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  const row=[i];
  for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,previous[j]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
  previous=row;
 }
 return previous[b.length]<=1;
}

export function wordAudioChoices(word:Word,vocabulary:Word[]):Word[]{
 // Extra choices only: the review queue and credit still belong to the current unit.
 const pool=word.id?.startsWith('sp2-u')
  ?[...vocabulary,...smartPhonics2Unit1.words,...smartPhonics2Unit2.words]:vocabulary;
 const labels=new Set([audioKey(word.en)]),sounds=new Set([audioSource(word.en)||audioKey(word.en)]);
 const candidates:Word[]=[];
 for(const candidate of shuffle(pool)){
  const label=audioKey(candidate.en),sound=audioSource(candidate.en)||label;
  if(labels.has(label)||sounds.has(sound)||similarReadingWords(word.en,candidate.en))continue;
  labels.add(label);sounds.add(sound);candidates.push(candidate);
 }
 let best:Word[]=[];
 function choose(start:number,chosen:Word[]):boolean{
  if(chosen.length>best.length)best=[...chosen];
  if(chosen.length===3)return true;
  for(let i=start;i<candidates.length;i++){
   if(chosen.some(w=>similarReadingWords(w.en,candidates[i].en)))continue;
   if(choose(i+1,[...chosen,candidates[i]]))return true;
  }
  return false;
 }
 choose(0,[]);
 return shuffle([word,...best]);
}

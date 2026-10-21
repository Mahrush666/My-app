import type {Word} from '../app/words';
import {audioKey,audioSource} from './audio';
import {shuffle} from './random';

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
 const labels=new Set([audioKey(word.en)]);
 const sounds=new Set([audioSource(word.en)||audioKey(word.en)]);
 const alternatives:Word[]=[];
 for(const candidate of shuffle(vocabulary)){
  const label=audioKey(candidate.en),sound=audioSource(candidate.en)||label;
  if(labels.has(label)||sounds.has(sound)||[word,...alternatives].some(w=>similarReadingWords(w.en,candidate.en)))continue;
  labels.add(label);sounds.add(sound);alternatives.push(candidate);
  if(alternatives.length===3)break;
 }
 return shuffle([word,...alternatives]);
}

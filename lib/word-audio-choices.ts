import type {Word} from '../app/words';
import {audioKey,audioSource} from './audio';
import {shuffle} from './random';

export function wordAudioChoices(word:Word,vocabulary:Word[]):Word[]{
 const labels=new Set([audioKey(word.en)]);
 const sounds=new Set([audioSource(word.en)||audioKey(word.en)]);
 const alternatives:Word[]=[];
 for(const candidate of shuffle(vocabulary)){
  const label=audioKey(candidate.en),sound=audioSource(candidate.en)||label;
  if(labels.has(label)||sounds.has(sound))continue;
  labels.add(label);sounds.add(sound);alternatives.push(candidate);
  if(alternatives.length===3)break;
 }
 return shuffle([word,...alternatives]);
}

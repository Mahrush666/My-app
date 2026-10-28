import type {Word} from '../app/words';
export function yesNoQuestion(word:Word,truth:boolean,vocabulary:Word[]):string{
 if(word.action){
  const action=truth?word.action:vocabulary.find(w=>w.action&&w.action.ing!==word.action!.ing)?.action;
  return `${word.action.subject==='they'?'Are':'Is'} ${word.action.subject} ${action?.ing||word.action.ing}?`;
 }
 const noun=truth?word:vocabulary.find(w=>!w.action&&w.en!==word.en)||word;
 const label=['sea','sun'].includes(noun.en)?'the '+noun.en:/^(?:a|an|the) /i.test(noun.en)?noun.en:'a '+noun.en;
 return 'Is it '+label+'?';
}

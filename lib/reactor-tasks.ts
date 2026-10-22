import {shuffle} from './random';
export const reactorTaskTypes=['build','spelling','meaning'] as const;
export type ReactorTaskType=typeof reactorTaskTypes[number];
export function spellingChoices(word:string):string[]{
 const wrong=new Set<string>();const positions=[...word].flatMap((c,i)=>/[a-z]/i.test(c)?[i]:[]);
 for(const i of shuffle(positions)){
  if(i+1<word.length&&/[a-z]/i.test(word[i+1])&&word[i]!==word[i+1])wrong.add(word.slice(0,i)+word[i+1]+word[i]+word.slice(i+2));
  if(positions.length>2)wrong.add(word.slice(0,i)+word.slice(i+1));
  const replacement=word[i].toLowerCase()==='a'?'e':'a';
  wrong.add(word.slice(0,i)+replacement+word.slice(i+1));
 }
 wrong.delete(word);let i=0;
 while(wrong.size<3)wrong.add(word+String.fromCharCode(97+i++));
 return shuffle([word,...shuffle([...wrong]).slice(0,3)]);
}

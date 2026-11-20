import {shuffle} from './random';
export const isCvcLesson=(id?:string)=>id==='act3-u7-lesson5';
// Include every target letter (with repeats) plus unique distractors.
export function cvcLetterTiles(word:string){
 const count=6+Math.floor(Math.random()*4);
 const distractors=shuffle([...'abcdefghijklmnopqrstuvwxyz'].filter(letter=>!word.includes(letter))).slice(0,count-word.length);
 return shuffle([...word,...distractors].map((letter,id)=>({id,letter})));
}

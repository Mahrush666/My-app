import {useEffect,useMemo,useRef,useState} from 'react';
import {Volume2} from 'lucide-react';
import FinishCelebration from './finish-celebration';
import {speak,stopSpeaking,type Word} from './words';
import {cvcLetterTiles} from '../lib/cvc-practice';
export default function CvcWordBuilder({vocabulary,onAnswer}:{vocabulary:Word[];onAnswer:(word:Word,correct:boolean,correction:boolean,answer:string)=>Promise<void>}){
 const [index,setIndex]=useState(0),[chosen,setChosen]=useState<number[]>([]),[correct,setCorrect]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState('');
 const busy=useRef(false),marked=useRef(false),word=vocabulary[index];
 const tiles=useMemo(()=>word?cvcLetterTiles(word.en):[],[word]);
 useEffect(()=>{setChosen([]);setCorrect(false);setMessage('');marked.current=false;return stopSpeaking},[word]);
 async function check(){
  if(!word||busy.current||correct||chosen.length!==word.en.length)return;
  busy.current=true;setSaving(true);const answer=chosen.map(i=>tiles[i].letter).join(''),ok=answer===word.en;
  try{await onAnswer(word,ok,marked.current,answer);marked.current=true;setCorrect(ok);setMessage(ok?'✓ Well done! 真棒！':'Listen and try again. 再听一遍，试试看。');if(!ok)setChosen([])}catch{setMessage('Could not save. Tap OK to retry. 保存失败，请重试。')}finally{busy.current=false;setSaving(false)}
 }
 if(!word)return <section className="spelling-practice"><FinishCelebration/><h2>⭐ Finished! 已完成！</h2><button onClick={()=>setIndex(0)}>Practise again 再练习</button></section>;
 return <section className="spelling-practice cvc-word-builder"><div className="quiz-top"><h3>Listen & build 听音拼词</h3><span>{index+1} / {vocabulary.length}</span></div><p>Listen. Choose the letters in order. 听一听，按顺序选字母。</p>
 <button className="listen-prompt" aria-label="Listen to the word" onClick={()=>speak(word.en)}><Volume2 size={40}/>Listen 听一听</button>
 <div className="spelling-slots" aria-label="Your word">{[...word.en].map((_,i)=><button className="spelling-slot" key={i} aria-label={'Clear letter '+(i+1)} disabled={saving||correct||chosen[i]===undefined} onClick={()=>{setChosen(c=>c.slice(0,i));setMessage('')}}>{chosen[i]===undefined?'_':tiles[chosen[i]].letter}</button>)}</div>
 <div className="spelling-tiles" aria-label="Available letters">{tiles.map((tile,i)=><button key={tile.id} aria-label={'Add letter '+tile.letter} disabled={saving||correct||chosen.includes(i)||chosen.length===word.en.length} onClick={()=>{setChosen(c=>[...c,i]);setMessage('')}}>{tile.letter}</button>)}</div>
 <div className="spelling-actions"><button disabled={saving||correct||!chosen.length} onClick={()=>setChosen(c=>c.slice(0,-1))}>Undo 撤销</button>{correct?<button className="primary" onClick={()=>{stopSpeaking();setIndex(n=>n+1)}}>{index===vocabulary.length-1?'Finish 完成':'Next 下一题'}</button>:<button className="primary" disabled={saving||chosen.length!==word.en.length} onClick={()=>void check()}>{saving?'Saving…':'OK 确定'}</button>}</div><p role="status">{message}</p></section>;
}

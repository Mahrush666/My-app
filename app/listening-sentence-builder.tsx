import {useEffect,useMemo,useRef,useState} from 'react';
import {Volume2} from 'lucide-react';
import {speak,stopSpeaking,playAnswerSound} from '../lib/audio';
import {shuffle} from '../lib/random';
import type {SentencePractice} from '../lib/sentence-practice';
import FinishCelebration from './finish-celebration';
export default function ListeningSentenceBuilder({sentences,onAnswer}:{sentences:SentencePractice[];onAnswer:(id:string,answer:string,correct:boolean)=>Promise<void>}){
 const [index,setIndex]=useState(0),[chosen,setChosen]=useState<number[]>([]),[correct,setCorrect]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const saving=useRef(false),alive=useRef(true),sentence=sentences[index];
 const tiles=useMemo(()=>{if(!sentence)return [];const original=sentence.text.split(/\s+/).map((text,id)=>({text,id}));const mixed=shuffle(original);return mixed.every((t,i)=>t.text===original[i].text)?[...mixed.slice(1),mixed[0]]:mixed},[sentence]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;stopSpeaking()}},[]);
 useEffect(()=>{setChosen([]);setCorrect(false);setMessage('');stopSpeaking()},[sentence]);
 async function check(){if(saving.current||correct||!sentence||chosen.length!==tiles.length)return;saving.current=true;setBusy(true);const answer=chosen.map(i=>tiles[i].text).join(' '),right=answer===sentence.text;try{await onAnswer(sentence.id,answer,right);if(!alive.current)return;playAnswerSound(right);setCorrect(right);setMessage(right?'✓ Well done! 答对了！':'Listen and try again. 再听一遍，试试看。')}catch{if(alive.current)setMessage('Could not save. Tap OK to retry. 保存失败，请重试。')}finally{saving.current=false;if(alive.current)setBusy(false)}}
 if(!sentence)return <section className="sentence-practice"><FinishCelebration/><h2>⭐ Finished! 已完成！</h2><button onClick={()=>setIndex(0)}>Practise again 再练习</button></section>;
 return <section className="sentence-practice quiz-surface"><div className="quiz-top"><h2>Listen & build the sentence 听音组句</h2><span>{index+1} / {sentences.length}</span></div>
 <button className="primary action-listen" aria-label="Listen to the sentence" onClick={()=>speak(sentence.text)}><Volume2/>Listen 听一听</button>
 <p>Listen, then tap the words in order. 听句子，再按顺序点击单词。</p>
 <div className="sentence-slots" aria-label="Your sentence">{tiles.map((_,i)=><button key={i} aria-label={chosen[i]===undefined?'Empty word slot '+(i+1):'Remove word '+(i+1)+': '+tiles[chosen[i]].text} disabled={busy||correct||chosen[i]===undefined} onClick={()=>{setChosen(c=>c.filter((_,n)=>n!==i));setMessage('')}}>{chosen[i]===undefined?'___':tiles[chosen[i]].text}</button>)}</div>
 <div className="spelling-tiles sentence-tiles" aria-label="Word tiles">{tiles.map((tile,i)=><button key={tile.id} aria-label={'Add word: '+tile.text} disabled={busy||correct||chosen.includes(i)} onClick={()=>{setChosen(c=>[...c,i]);setMessage('')}}>{tile.text}</button>)}</div>
 <div className="action-card-navigation"><button disabled={busy||correct||!chosen.length} onClick={()=>{setChosen(c=>c.slice(0,-1));setMessage('')}}>Undo 撤销</button><button disabled={busy||correct||!chosen.length} onClick={()=>{setChosen([]);setMessage('')}}>Clear 清空</button></div>
 <p className="feedback" role="status">{message}</p>{correct?<button className="primary" onClick={()=>{setChosen([]);setCorrect(false);setMessage('');setIndex(i=>i+1)}}>{index===sentences.length-1?'Finish 完成':'Next 下一题'}</button>:<button className="primary" disabled={busy||chosen.length!==tiles.length} onClick={()=>void check()}>{busy?'Saving…':'OK 确定'}</button>}
 </section>;
}

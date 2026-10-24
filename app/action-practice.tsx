import FinishCelebration from './finish-celebration';
"use client";
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Volume2,Check} from 'lucide-react';
import {speak,stopSpeaking,type Word,type Progress} from './words';
import {publicAsset} from '@/lib/public-runtime';
import {playAnswerSound} from '@/lib/audio';
import {reviewCards} from '@/lib/review-schedule';
import {shuffle} from '@/lib/random';
type Mode='look-listen'|'sound-picture'|'yes-no';
export default function ActionPractice({mode,vocabulary,progress,allCards=false,showWrittenWord=false,onAnswer}:{mode:Mode;vocabulary:Word[];progress:Progress;allCards?:boolean;showWrittenWord?:boolean;onAnswer:(word:Word,correct:boolean,mode:string,correction?:boolean)=>Promise<void>}){
 const [queue,setQueue]=useState(()=>mode==='look-listen'||allCards?vocabulary:reviewCards(vocabulary,progress,Date.now()));
 const [round,setRound]=useState(0),[selected,setSelected]=useState(-1),[result,setResult]=useState<boolean|null>(null),[message,setMessage]=useState(''),[saving,setSaving]=useState(false);
 const marked=useRef(false),busy=useRef(false),alive=useRef(true),truths=useRef(shuffle(vocabulary.map((_,i)=>i%2===0)));
 const word=queue[round];
 const choices=useMemo(()=>word?shuffle([word,...shuffle(vocabulary.filter(w=>(w.id||w.en)!==(word.id||word.en))).slice(0,3)]):[],[word,vocabulary]);
 const truth=truths.current[round%truths.current.length]??true;
 const other=choices.find(w=>(w.id||w.en)!==(word?.id||word?.en));
 const question=word?.action?`Is ${word.action.subject} ${(truth?word:other)?.action?.ing}?`:'';
 useEffect(()=>{marked.current=false;setSelected(-1);setResult(null);setMessage('');stopSpeaking()},[word]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;stopSpeaking()}},[]);
 async function mark(correct:boolean){if(busy.current||result===true||!word)return;playAnswerSound(correct);setResult(correct);setMessage(correct?'⭐ Well done! 答对了！':'💛 Listen and try again. 听一听，再试试。');if(marked.current&&!correct)return;busy.current=true;setSaving(true);const correction=marked.current;try{await onAnswer(word,correct,mode,correction);marked.current=true;}catch{marked.current=false;if(alive.current){setResult(null);setMessage('Could not save. Please try again. 暂时无法保存，请重试。')}}finally{busy.current=false;if(alive.current)setSaving(false)}}
 function restart(all:boolean){stopSpeaking();setQueue(all?vocabulary:reviewCards(vocabulary,progress,Date.now()));setRound(0);setSelected(-1);setResult(null);setMessage('');marked.current=false;}
 if(!word)return <section className="empty">{round>0&&<FinishCelebration/>}<h2>{mode==='look-listen'?'⭐ Great listening! 听得真棒！':'⭐ Review complete! 复习完成！'}</h2><p>{mode==='look-listen'?'Listen again whenever you like. 随时可以再听一遍。':'Remembered cards return when they are due. You can also practise again. 记住的卡片会稍后再次出现，也可以继续练习。'}</p>{mode!=='look-listen'&&<button onClick={()=>restart(false)}>Check due cards 查看待复习卡片</button>}<button onClick={()=>restart(true)}>Practise all cards 再练习</button></section>;
 const picture=<div className="picture-prompt"><img src={publicAsset(word.picture!)} alt="" decoding="async"/></div>;
 return <section className="picture-surface action-practice"><div className="quiz-top">{round>0&&<FinishCelebration/>}<h2>{mode==='look-listen'?'Look & listen 看图听音':mode==='sound-picture'?'Choose a picture 听音选图':'Yes or no 是或否'}</h2><span>{round+1} / {queue.length}</span></div>
 {mode==='sound-picture'?<><button className="picture-prompt audio-prompt" aria-label="Listen to the sentence" onClick={()=>speak(word.en)}><Volume2 size={64}/></button><p className="picture-instruction">🔊 → 🖼️ → OK</p><div className="action-picture-choices">{choices.map((w,i)=><button key={w.id||w.en} aria-label={'Choose picture '+(i+1)} aria-pressed={selected===i} disabled={saving||result===true} className={selected===i?'selected':''} onClick={()=>{setSelected(i);setResult(null);setMessage('')}}><img src={publicAsset(w.picture!)} alt="" decoding="async"/>{selected===i&&<Check aria-hidden="true"/>}</button>)}</div><button className="primary" disabled={selected<0||saving||result===true} onClick={()=>void mark((choices[selected].id||choices[selected].en)===(word.id||word.en))}>OK ✓</button></>:<>{picture}{mode==='look-listen'&&showWrittenWord&&<p className="picture-written-word">{word.en}</p>}<button className="primary action-listen" aria-label={mode==='yes-no'?'Listen to the question':'Listen to the sentence'} onClick={()=>speak(mode==='yes-no'?question:word.en)}><Volume2 size={38}/>Listen 听一听</button>{mode==='yes-no'?<><p className="picture-instruction">🔊 → ✓ / ✗</p><div className="yes-no-choices"><button aria-label="Yes" disabled={saving||result===true} onClick={()=>void mark(truth)}>✓ <span>Yes 是</span></button><button aria-label="No" disabled={saving||result===true} onClick={()=>void mark(!truth)}>✗ <span>No 不是</span></button></div></>:<p className="picture-instruction">Listen and repeat. 听一听，跟着说。</p>}</>}
 <p className="feedback" aria-live="polite">{message}</p><div className="action-card-navigation">{mode==='look-listen'&&<button aria-label="Previous picture" disabled={round===0} onClick={()=>setRound(n=>n-1)}><ArrowLeft/>Back 上一张</button>}<button disabled={saving||(mode!=='look-listen'&&result!==true)} onClick={()=>{stopSpeaking();setRound(n=>n+1)}}><ArrowRight/>{round===queue.length-1?'Finish 完成':'Next 下一张'}</button></div></section>;
}

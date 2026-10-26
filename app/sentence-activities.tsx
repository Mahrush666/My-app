'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Volume2,ArrowLeft,ArrowRight} from 'lucide-react';
import {type Word,speak,stopSpeaking} from './words';
import {shuffle} from '../lib/random';
import {publicAsset} from '../lib/public-runtime';
import {playAnswerSound} from '../lib/audio';
import FinishCelebration,{DoneSticker} from './finish-celebration';
type Mode='look-listen'|'word-choice'|'sound-picture'|'sentence-build';
export default function SentenceActivities({mode,vocabulary,onAnswer}:{mode:Mode;vocabulary:Word[];onAnswer:(word:Word,correct:boolean,correction:boolean,answer:string)=>Promise<void>}){
 const rounds=useMemo(()=>Array.from({length:Math.ceil(vocabulary.length/4)},(_,i)=>vocabulary.slice(i*4,i*4+4)),[vocabulary]);
 const [round,setRound]=useState<number|null>(null),[step,setStep]=useState(0),[done,setDone]=useState<number[]>([]),[selected,setSelected]=useState(-1),[chosen,setChosen]=useState<number[]>([]),[correct,setCorrect]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[roundDone,setRoundDone]=useState(false);
 const writing=useRef(false),attempted=useRef(false),alive=useRef(true);
 const group=round===null?[]:rounds[round],model=mode==='sentence-build'&&step<group.length,word=group[step%Math.max(1,group.length)];
 const options=useMemo(()=>word?shuffle(vocabulary.filter(w=>w.category===word.category)):[],[word,vocabulary]);
 const tiles=useMemo(()=>word?shuffle(word.en.split(' ').map((text,id)=>({text,id}))):[],[word,step]);
 useEffect(()=>{setSelected(-1);setChosen([]);setCorrect(false);setMessage('');attempted.current=false;stopSpeaking()},[round,step]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;stopSpeaking()}},[]);
 function open(i:number){stopSpeaking();setRound(i);setStep(0);setRoundDone(false);setMessage('')}
 async function check(){if(writing.current||correct||!word)return;writing.current=true;setBusy(true);const answer=mode==='sentence-build'?chosen.map(i=>tiles[i].text).join(' '):options[selected]?.en||'';const right=answer===word.en;try{if(!model)await onAnswer(word,right,attempted.current,answer);if(!alive.current)return;attempted.current=true;playAnswerSound(right);setCorrect(right);setMessage(right?'⭐ Well done! 答对了！':'Listen and try again. 听一听，再试一次。');}catch{if(alive.current){setCorrect(false);setMessage('Could not save. Please try again. 暂时无法保存，请重试。')}}finally{writing.current=false;if(alive.current)setBusy(false)}}
 function next(){const total=group.length*(mode==='sentence-build'?2:1);if(step+1===total){setDone(old=>[...new Set([...old,round!])]);setRoundDone(true)}else setStep(n=>n+1)}
 const title=mode==='look-listen'?'Look & listen 看图听句子':mode==='word-choice'?'Choose the sentence 选句子':mode==='sound-picture'?'Listen & choose a picture 听句选图':'Build the sentence 组句子';
 if(round===null)return <section className="sentence-practice"><h2>{title}</h2><p>Four pictures per round · 每轮四张图</p><div className="spelling-rounds">{rounds.map((items,i)=><button key={i} onClick={()=>open(i)}><strong>Round {i+1} 第{i+1}轮</strong><span>{i===0?'Hair 头发':'Height 身高'}</span>{done.includes(i)&&<DoneSticker/>}</button>)}</div></section>;
 if(roundDone)return <section className="sentence-practice"><FinishCelebration kind={done.length===rounds.length?'exercise':'round'} title="Round complete! 本轮完成！"/><h2>⭐ Round {round+1} complete!</h2>{round+1<rounds.length&&<button className="primary" onClick={()=>open(round+1)}>Next round 下一轮 <ArrowRight/></button>}<button onClick={()=>setRound(null)}>Choose a round 选择一轮</button></section>;
 return <section className="sentence-practice picture-surface"><div className="quiz-top"><button disabled={busy} onClick={()=>setRound(null)}><ArrowLeft/>Rounds 返回</button><span>{step%group.length+1} / {group.length}{mode==='sentence-build'&&(model?' · With model 跟着拼':' · Your turn 自己拼')}</span></div><h2>{title}</h2>
 {mode==='sound-picture'?<><button className="picture-prompt audio-prompt" aria-label="Listen to the sentence" onClick={()=>speak(word.en)}><Volume2 size={52}/></button><div className="action-picture-choices">{options.map((w,i)=><button key={w.id} aria-label={'Choose picture '+(i+1)} aria-pressed={selected===i} disabled={busy||correct} onClick={()=>{setSelected(i);setMessage('')}}><img src={publicAsset(w.picture!)} alt=""/></button>)}</div></>:<><div className="picture-prompt"><img src={publicAsset(word.picture!)} alt=""/></div>{mode!=='word-choice'&&<button className="action-listen primary" aria-label="Listen to the sentence" onClick={()=>speak(word.en)}><Volume2/>Listen 听一听</button>}</>}
 {mode==='look-listen'&&<p className="picture-written-word">{word.en}</p>}
 {mode==='word-choice'&&<div className="sound-choices">{options.map((w,i)=><button className="written-choice" key={w.id} aria-pressed={selected===i} disabled={busy||correct} onClick={()=>{setSelected(i);setMessage('');speak(w.en)}}><Volume2 size={20}/>{w.en}</button>)}</div>}
 {mode==='sentence-build'&&<>{model&&<p className="picture-written-word sentence-model">{word.en}</p>}<div className="sentence-slots" aria-label="Your sentence">{word.en.split(' ').map((_,i)=><button key={i} disabled={busy||correct||chosen[i]===undefined} onClick={()=>setChosen(c=>c.slice(0,i))}>{chosen[i]===undefined?'___':tiles[chosen[i]].text}</button>)}</div><div className="spelling-tiles sentence-tiles">{tiles.map((t,i)=><button key={t.id} disabled={busy||correct||chosen.includes(i)} onClick={()=>{setChosen(c=>[...c,i]);setMessage('')}}>{t.text}</button>)}</div><button disabled={busy||correct||!chosen.length} onClick={()=>setChosen(c=>c.slice(0,-1))}>Undo 撤销</button></>}
 <p role="status">{message}</p><div className="action-card-navigation">{mode==='look-listen'||correct?<button className="primary" disabled={busy} onClick={next}>{step+1===group.length*(mode==='sentence-build'?2:1)?'Finish round 完成本轮':'Next 下一题'}<ArrowRight/></button>:<button className="primary" disabled={busy||(mode==='sentence-build'?chosen.length!==tiles.length:selected<0)} onClick={()=>void check()}>{busy?'Saving…':'OK ✓'}</button>}</div></section>
}

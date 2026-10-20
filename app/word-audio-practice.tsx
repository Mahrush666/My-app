import {useEffect,useMemo,useRef,useState} from 'react';
import {Volume2} from 'lucide-react';
import {speak,stopSpeaking,type Word,type Progress} from './words';
import {shuffle} from '../lib/random';
import {reviewCards} from '../lib/review-schedule';
type Mode='word-sound'|'sound-word';
export default function WordAudioPractice({mode,vocabulary,progress,allCards=false,onAnswer}:{mode:Mode;vocabulary:Word[];progress:Progress;allCards?:boolean;onAnswer:(word:Word,correct:boolean,mode:string,correction:boolean)=>Promise<void>}){
 const [queue]=useState(()=>allCards?vocabulary:reviewCards(vocabulary,progress,Date.now()));
 const [index,setIndex]=useState(0),[choice,setChoice]=useState(-1),[correct,setCorrect]=useState(false),[feedback,setFeedback]=useState(''),[saving,setSaving]=useState(false);
 const busy=useRef(false),marked=useRef(false),word=queue[index];
 const choices=useMemo(()=>word?shuffle([word,...shuffle(vocabulary.filter(w=>(w.id||w.en)!==(word.id||word.en))).slice(0,3)]):[],[word,vocabulary]);
 useEffect(()=>{setChoice(-1);setCorrect(false);setFeedback('');marked.current=false;return stopSpeaking},[word]);
 async function check(){if(!word||choice<0||busy.current||correct)return;busy.current=true;setSaving(true);const ok=choices[choice].en===word.en;try{await onAnswer(word,ok,mode,marked.current);marked.current=true;setCorrect(ok);setFeedback(ok?'✓ Correct! 答对了！':'Try again 再试一次');}catch{setFeedback('Could not save. Tap OK to retry. 保存失败，请重试。')}finally{busy.current=false;setSaving(false)}}
 if(!word)return <section className="quiz-surface"><h2>⭐ Finished! 已完成！</h2></section>;
 return <section className="quiz-surface"><div className="quiz-top"><h3>{mode==='word-sound'?'Read → choose the sound 读词选音':'Listen → choose the word 听音选词'}</h3><span>{index+1} / {queue.length}</span></div>
 {mode==='word-sound'?<h2 className="phonics-word">{word.en}</h2>:<button className="listen-prompt" aria-label="Listen to the word" onClick={()=>speak(word.en)}><Volume2 size={40}/>Listen 听一听</button>}
 <div className="answers">{choices.map((w,i)=><button key={w.id||w.en} aria-label={mode==='word-sound'?'Listen to option '+(i+1):w.en} aria-pressed={choice===i} disabled={saving||correct} onClick={()=>{setChoice(i);setFeedback('');if(mode==='word-sound')speak(w.en)}}>{mode==='word-sound'?<><Volume2 size={30}/><span>{i+1}</span></>:w.en}</button>)}</div>
 <p className="feedback" role="status">{feedback}</p>{correct?<button className="primary" onClick={()=>{stopSpeaking();setIndex(n=>n+1)}}>{index===queue.length-1?'Finish 完成':'Next 下一题'}</button>:<button className="primary" disabled={choice<0||saving} onClick={()=>void check()}>{saving?'Saving…':'OK 确定'}</button>}</section>;
}

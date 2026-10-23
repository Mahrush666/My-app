import {useEffect,useMemo,useRef,useState} from 'react';
import {Volume2} from 'lucide-react';
import {speak,stopSpeaking,type Word} from './words';
import {publicAsset} from '../lib/public-runtime';
import {spellingGaps,spellingOrder,spellingTiles} from '../lib/spelling-steps';
type Saved=Record<string,number>;
export default function SpellingPractice({vocabulary,scope,onAnswer}:{vocabulary:Word[];scope?:string;onAnswer:(w:Word,correct:boolean,correction:boolean,stage:number)=>Promise<void>}){
 const key='wordquest-spelling-v1:'+ (scope||'guest')+':'+vocabulary.map(w=>(w.id||w.en)+'='+w.en).join('|');
 const [saved,setSaved]=useState<Saved>(()=>{try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}});
 const rounds=useMemo(()=>Array.from({length:Math.ceil(vocabulary.length/3)},(_,i)=>vocabulary.slice(i*3,i*3+3)),[vocabulary]);
 const [round,setRound]=useState<number|null>(null),[step,setStep]=useState(0);
 const [chosen,setChosen]=useState<number[]>([]),[correct,setCorrect]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState('');
 const busy=useRef(false),marked=useRef(false);
 const group=round===null?[]:rounds[round]||[],stage=Math.floor(step/(group.length||1)),word=group[step%group.length];
 const order=useMemo(()=>word?spellingOrder(word.en):[],[word]);
 const gaps=useMemo(()=>word?spellingGaps(word.en,stage,order):[],[word,stage,order]);
 const tiles=useMemo(()=>word?spellingTiles(word.en,gaps):[],[word,gaps]);
 useEffect(()=>{setChosen([]);setCorrect(false);setMessage('');marked.current=false;stopSpeaking()},[round,step]);
 useEffect(()=>()=>stopSpeaking(),[]);
 function remember(next:number){if(round===null)return;const update={...saved,[round]:next};setSaved(update);try{localStorage.setItem(key,JSON.stringify(update))}catch{}}
 function open(i:number){setChosen([]);setCorrect(false);setMessage('');const at=saved[i];setStep(Number.isInteger(at)&&at>=0&&at<rounds[i].length*5?at:0);setRound(i);}
 async function check(){
  if(!word||busy.current||correct||chosen.length!==gaps.length)return;
  const ok=gaps.every((position,i)=>word.en[position].toLowerCase()===tiles[chosen[i]].letter.toLowerCase());
  busy.current=true;setSaving(true);
  try{
   // All stages are reported; only the independent fifth spelling completes a word.
   await onAnswer(word,ok,marked.current,stage+1);marked.current=true;
   setCorrect(ok);setMessage(ok?'✓ Well done! 真棒！':'Try again 再试一次');
   if(!ok)setChosen([]);
  }catch{setMessage('Could not save. Tap OK to retry. 保存失败，请重试。')}
  finally{busy.current=false;setSaving(false)}
 }
 if(round===null)return <section className="spelling-practice"><h3>Build the word 拼单词</h3><p>Three words at a time · 每轮三个词</p><div className="spelling-rounds">{rounds.map((words,i)=><button key={i} onClick={()=>open(i)}><strong>Round {i+1} 第{i+1}轮</strong><span>{words.length} words · {Math.min(saved[i]||0,words.length*5)}/{words.length*5} ✓</span></button>)}</div></section>;
 if(!word||stage>=5)return <section className="spelling-practice"><h3>⭐ Round finished! 本轮完成！</h3><button className="primary" onClick={()=>setRound(null)}>Choose a round 选择一轮</button></section>;
 return <section className="spelling-practice"><div className="quiz-top"><button disabled={saving} onClick={()=>{stopSpeaking();setRound(null)}}>← Rounds 返回</button><span>Round {round+1} · {step+1}/{group.length*5}</span></div>
 <p>Step {stage+1}/5 · {stage===0?'Look and build 看词拼写':'Fill the gaps 补全单词'}</p>
 {word.picture?<img className="spelling-picture" src={publicAsset(word.picture)} alt=""/>:<div className="word-emoji" aria-hidden="true">{word.icon}</div>}
 <button className="action-listen" onClick={()=>speak(word.en)} aria-label="Listen to the word"><Volume2/> Listen 听一听</button>
 {stage===0&&<h2 className="spelling-model">{word.en}</h2>}
 <div className="spelling-slots" aria-label="Word to complete">{word.en.split(' ').map((part,partIndex)=>{const offset=word.en.split(' ').slice(0,partIndex).join(' ').length+(partIndex?1:0);return <span className="spelling-part" key={partIndex}>{[...part].map((letter,j)=>{const position=offset+j,gap=gaps.indexOf(position);return gap<0?<span className="spelling-fixed" key={j}>{letter}</span>:<button className="spelling-slot" key={j} disabled={saving||correct||chosen[gap]===undefined} aria-label={'Clear from letter '+(position+1)} onClick={()=>{setChosen(c=>c.slice(0,gap));setMessage('')}}>{chosen[gap]===undefined?'_':tiles[chosen[gap]]?.letter||'_' }</button>})}</span>})}</div>
 <div className="spelling-tiles" aria-label="Available letters">{tiles.map((tile,i)=><button key={tile.id} disabled={saving||correct||chosen.includes(i)||chosen.length===gaps.length} onClick={()=>{setChosen(c=>[...c,i]);setMessage('')}}>{tile.letter}</button>)}</div>
 <div className="spelling-actions"><button disabled={saving||correct||!chosen.length} onClick={()=>setChosen(c=>c.slice(0,-1))}>Undo 撤销</button>{correct?<button className="primary" onClick={()=>{stopSpeaking();remember(step+1);setChosen([]);setCorrect(false);setMessage('');setStep(n=>n+1)}}>{step+1===group.length*5?'Finish round 完成本轮':'Next 下一题'}</button>:<button className="primary" disabled={saving||chosen.length!==gaps.length} onClick={()=>void check()}>{saving?'Saving…':'OK 确定'}</button>}</div><p role="status">{message}</p></section>;
}

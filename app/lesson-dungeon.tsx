import {useEffect,useMemo,useRef,useState} from 'react';
import {Volume2} from 'lucide-react';
import DungeonAdventure from './dungeon-adventure';
import FinishCelebration from './finish-celebration';
import {shuffle} from '../lib/random';
import {publicAsset} from '../lib/public-runtime';
import {speak,stopSpeaking,type Word} from './words';
export default function LessonDungeon({vocabulary,onAnswer,onExit}:{vocabulary:Word[];onAnswer:(word:Word,correct:boolean,answer:string,correction:boolean)=>Promise<void>;onExit:()=>void}){
 const [index,setIndex]=useState(0),[choice,setChoice]=useState(-1),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState('');const locked=useRef(false),marked=useRef(false),word=vocabulary[index];
 const options=useMemo(()=>word?shuffle([word,...shuffle(vocabulary.filter(w=>w.en!==word.en)).slice(0,3)]):[],[word,vocabulary]);
 const pictures=options.length>1&&options.every(w=>w.picture);
 useEffect(()=>{setIndex(0)},[vocabulary]);
 useEffect(()=>{setChoice(-1);setFeedback('');marked.current=false;stopSpeaking()},[word]);
 async function submit(onResult:(correct:boolean)=>void){if(!word||choice<0||locked.current)return;locked.current=true;setBusy(true);const answer=options[choice].en,correct=answer===word.en;
 try{await onAnswer(word,correct,answer,marked.current);marked.current=true;onResult(correct);setFeedback(correct?'':'Listen and try again. 听一听，再试试。');if(correct){setChoice(-1);setIndex(n=>n+1)}}catch{setFeedback('Could not save. Tap OK to retry. 保存失败，请重试。')}finally{locked.current=false;setBusy(false)}}
 if(!word)return <section className="quiz-surface"><FinishCelebration title="Dungeon cleared! 地牢闯关成功！"/><h2>All {vocabulary.length} words practised! 全部练习完成！</h2><button onClick={()=>{setIndex(0);setChoice(-1);setFeedback('')}}>Play again 再玩一次</button><button onClick={onExit}>Back 返回</button></section>;
 return <DungeonAdventure completed={index} total={vocabulary.length} onExit={onExit} renderChallenge={onResult=><div className="dungeon-lesson-question"><h3>{pictures?'Listen and choose the picture. 听音选图。':'Listen and choose the word. 听音选词。'}</h3><button className="listen-prompt" aria-label="Listen to the word" onClick={()=>speak(word.en,word.recording)}><Volume2/>Listen 听一听</button><div className={pictures?'dungeon-picture-options':'answers'}>{options.map((option,i)=><button key={option.id||option.en} disabled={busy} aria-pressed={choice===i} aria-label={pictures?'Choose picture '+(i+1):option.en} onClick={()=>{setChoice(i);setFeedback('')}}>{pictures?<img src={publicAsset(option.picture!)} alt=""/>:option.en}</button>)}</div><p role="status">{feedback}</p><button className="primary" disabled={busy||choice<0} onClick={()=>void submit(onResult)}>{busy?'Saving…':'OK 确定'}</button></div>}/>;
}

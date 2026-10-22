import {useMemo,useState} from 'react';
import {Volume2} from 'lucide-react';
import {speak,type Word} from './words';
import {publicAsset} from '../lib/public-runtime';
import {spellingOrder,spellingTiles} from '../lib/spelling-steps';
import {spellingChoices,type ReactorTaskType} from '../lib/reactor-tasks';
export default function ReactorTask({word,options,type,onAnswer}:{word:Word;options:Word[];type:ReactorTaskType;onAnswer:(text:string)=>void}){
 const [chosen,setChosen]=useState<number[]>([]);
 const gaps=useMemo(()=>spellingOrder(word.en).sort((a,b)=>a-b),[word]);
 const tiles=useMemo(()=>spellingTiles(word.en,gaps),[word,gaps]);
 const spellings=useMemo(()=>spellingChoices(word.en),[word]);
 function submit(){const result=[...word.en];gaps.forEach((position,i)=>{result[position]=tiles[chosen[i]].letter});onAnswer(result.join(''));setChosen([]);}
 return <div className="reactor-task"><h2>{type==='build'?'Build the word 拼单词':type==='spelling'?'Choose the correct spelling 选正确拼写':'Choose the English word 选英文'}</h2>
 {type==='meaning'?<h3 lang="zh-CN">{word.zh}</h3>:word.picture?<img className="reactor-task-picture" src={publicAsset(word.picture)} alt=""/>:<span className="reactor-picture-icon" aria-hidden="true">{word.icon}</span>}
 <button className="hear-hint" onClick={()=>speak(word.en)}><Volume2 size={20}/>Listen 听一听</button>
 {type==='build'?<><div className="spelling-slots" aria-label="Word to build">{word.en.split(' ').map((part,p)=>{const offset=word.en.split(' ').slice(0,p).join(' ').length+(p?1:0);return <span className="spelling-part" key={p}>{[...part].map((letter,j)=>{const gap=gaps.indexOf(offset+j);return gap<0?<span className="spelling-fixed" key={j}>{letter}</span>:<span className="spelling-slot" key={j}>{chosen[gap]===undefined?'_':tiles[chosen[gap]].letter}</span>})}</span>})}</div><div className="spelling-tiles">{tiles.map((tile,i)=><button key={tile.id} disabled={chosen.includes(i)||chosen.length===gaps.length} onClick={()=>setChosen(c=>[...c,i])}>{tile.letter}</button>)}</div><div className="spelling-actions"><button disabled={!chosen.length} onClick={()=>setChosen(c=>c.slice(0,-1))}>Undo 撤销</button><button className="primary" disabled={chosen.length!==gaps.length} onClick={submit}>OK 确定</button></div></>:<div className="answers">{(type==='spelling'?spellings:options.map(w=>w.en)).map(text=><button key={text} onClick={()=>onAnswer(text)}>{text}</button>)}</div>}
 </div>;
}

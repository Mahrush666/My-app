import {useHomeworkTime} from './use-homework-time';
import {useEffect,useMemo,useRef,useState} from 'react';
import WordReactor from '../app/word-reactor';
import {speak,stopSpeaking} from '../app/words';
import {publicAsset} from '../lib/public-runtime';
import {shuffle} from '../lib/random';
import type {DailyRun,DailyTask} from '../lib/daily-practice';
import FinishCelebration from '../app/finish-celebration';
import {playAnswerSound,prepareAnswerSounds} from '../lib/audio';
import {prepareCelebration} from '../lib/celebration';
import GogoPractice from './gogo-practice';
import GogoAssets,{GogoImage} from './gogo-assets';
import './daily-practice.css';
function Challenge({task,submit}:{task:DailyTask;submit:(answer:string)=>Promise<boolean>}){
 const [selected,setSelected]=useState(''),[chosen,setChosen]=useState<number[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');const locked=useRef(false),build=task.kind==='letters'||task.kind==='sentence';
 const tiles=useMemo(()=>shuffle((task.kind==='letters'?[...task.expected]:task.expected.split(' ')).map((text,id)=>({text,id}))),[task]);
 useEffect(()=>()=>stopSpeaking(),[]);
 async function check(){if(locked.current)return;locked.current=true;setBusy(true);setMessage('');const answer=build?chosen.map(i=>tiles[i].text).join(task.kind==='letters'?'':' '):selected;playAnswerSound(answer===task.expected);try{const ok=await submit(answer);if(!ok)setMessage('Listen and try again. 听一听，再试一次。')}catch(e){setMessage((e as Error).message)}finally{locked.current=false;setBusy(false)}}
 return <div className="daily-challenge"><h3>{task.prompt}</h3>{task.image&&<GogoImage className="daily-prompt" src={publicAsset(task.image)} alt=""/>}{task.listen&&<button aria-label="Listen to the question" onClick={()=>speak(task.listen!)}>🔊 Listen 听一听</button>}{build?<><div className="sentence-slots">{chosen.map((n,i)=><button disabled={busy} key={i} onClick={()=>setChosen(c=>c.slice(0,i))}>{tiles[n].text===' '?'␣':tiles[n].text}</button>)}{!chosen.length&&<span>___ ___ ___</span>}</div><div className="spelling-tiles sentence-tiles">{tiles.map((t,i)=><button key={t.id} disabled={busy||chosen.includes(i)} onClick={()=>setChosen(c=>[...c,i])}>{t.text===' '?'␣':t.text}</button>)}</div><button disabled={busy||!chosen.length} onClick={()=>setChosen(c=>c.slice(0,-1))}>Undo 撤销</button></>:<div className={'daily-options '+(task.kind==='pictures'?'daily-pictures':'')}>{task.options?.map(o=><button key={o.id} disabled={busy} aria-label={task.kind==='audio-options'?'Listen to option '+(task.options!.indexOf(o)+1):task.kind==='pictures'?'Choose picture '+(task.options!.indexOf(o)+1):undefined} aria-pressed={selected===o.text} onClick={()=>{setSelected(o.text);setMessage('');if(task.kind!=='pictures')speak(o.text)}}>{task.kind==='pictures'?<GogoImage src={publicAsset(o.image!)} alt=""/>:task.kind==='audio-options'?'🔊 '+(task.options!.indexOf(o)+1):o.text}</button>)}</div>}<p role="status">{message}</p><button className="primary" disabled={busy||(build?chosen.length!==tiles.length:!selected)} onClick={()=>void check()}>{busy?'Saving…':'OK ✓'}</button></div>
}
export default function DailyAdventure({request,onExit,childId}:{childId?:string;request:(path:string,data:object)=>Promise<any>;onExit:()=>void}){
 const [run,setRun]=useState<DailyRun|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[replay,setReplay]=useState(false),[replayDone,setReplayDone]=useState<string[]>([]);
 const [mode,setMode]=useState<'archer'|'gogo'|null>(null),[feeding,setFeeding]=useState<{step:number;id:string}|null>(null);
 const alive=useRef(true);
 const [gogoReady,setGogoReady]=useState(false);
 const pictures=useMemo(()=>[...new Set((run?.tasks||[]).flatMap(t=>[t.image,...(t.options||[]).map(o=>o.image)]).filter((src):src is string=>Boolean(src)))].map(publicAsset),[run?.tasks]);
 const withArtwork=(content:React.ReactNode)=><GogoAssets pictures={pictures} onReady={setGogoReady} onExit={onExit}>{content}</GogoAssets>;
 const modeKey=(r:DailyRun)=>'wordquest-daily-mode:'+childId+':'+r.day+':'+r.id;
 useEffect(()=>{let current=true;alive.current=true;setRun(null);setFeeding(null);setMode(null);setGogoReady(false);setReplay(false);setReplayDone([]);request('/daily-practice',{}).then((r:DailyRun)=>{if(!current)return;setRun(r);try{const saved=localStorage.getItem(modeKey(r));if(saved==='archer'||saved==='gogo')setMode(saved)}catch{}}).catch(e=>{if(current)setError(e.message)});return()=>{current=false;alive.current=false}},[retry,childId]);
 const activeTask=run?.tasks?.find(t=>!(run.done||[]).includes(t.id));
 useHomeworkTime({childId:childId||'',assignmentId:activeTask?.assignmentId,version:activeTask?.assignmentVersion,enabled:Boolean(childId&&run&&(mode==='archer'||mode==='gogo'&&gogoReady)&&!run.finished&&!replay&&!feeding),request});
 const words=useMemo(()=>(run?.tasks||[]).map(t=>({id:t.id,en:t.expected,zh:'',icon:'',sentence:t.expected,category:'Daily adventure',picture:t.image})),[run?.id]);
 if(error)return <section className="panel"><p role="alert">{error}</p><button onClick={()=>{setError('');setRetry(n=>n+1)}}>Try again 重试</button><button onClick={onExit}>Dashboard 主页</button></section>;
 if(!run)return <p>Preparing your adventure… 正在准备冒险…</p>;
 if(!run.enabled||!run.tasks?.length)return <section className="panel"><p>{run.message||'Daily practice is turned off for this class. 这个班级尚未开启每日练习。'}</p><button onClick={onExit}>Dashboard 主页</button></section>;
 if(!feeding&&run.finished&&(!replay||replayDone.length>=run.tasks.length)){const finished=<section className="panel daily-finished"><FinishCelebration title={mode==='gogo'?'Gogo is full! 咕咕吃饱啦！':'Today’s adventure finished! 今日冒险完成！'}/>{mode==='gogo'&&<GogoImage className="gogo-finished" src={publicAsset('mascots/gogo/stage-12.webp')} alt="Full, happy Gogo giving two thumbs up"/>}<h2>Today’s practice finished! 今日练习已完成！</h2><p>⭐ Great work! See you tomorrow. 做得好，明天见！</p><button onClick={()=>{setReplayDone([]);setReplay(true);setMode(null);setGogoReady(false)}}>Practise again 再练习</button><button className="primary" onClick={onExit}>Dashboard 主页</button></section>;return mode==='gogo'?withArtwork(finished):finished;}
 const done=replay?replayDone:run.done||[],task=run.tasks.find(t=>!done.includes(t.id));
 if(!mode)return <section className="panel daily-mode-picker"><h2>Choose your adventure 选择小游戏</h2><p>12 questions · One game today<br/>12道题，一次小游戏</p><div className="daily-mode-cards">{(['archer','gogo'] as const).map(value=><button className={'daily-mode-card daily-mode-'+value} key={value} onClick={()=>{prepareAnswerSounds();prepareCelebration();setGogoReady(false);setMode(value);if(!replay)try{localStorage.setItem(modeKey(run),value)}catch{}}}><img src={publicAsset(value==='gogo'?'mascots/gogo/stage-01.webp':'mascots/archer-welcome.webp')} alt=""/><strong>{value==='gogo'?'Feed Gogo!':'Archer Adventure'}</strong><span>{value==='gogo'?'喂饱咕咕！':'弓箭手冒险'}</span></button>)}</div><p className="small-note">{done.length?`Continue from ${done.length} / ${run.tasks.length} · 接着上次的进度练习`:'Both games help finish your homework. 两种游戏都计入作业进度。'}</p><button onClick={onExit}>Dashboard 主页</button></section>;
 async function submit(answer:string){
  if(!task)return false;
  if(replay){const correct=answer===task.expected;if(correct){if(mode==='gogo')setFeeding({step:done.length,id:crypto.randomUUID()});setReplayDone(d=>[...d,task.id])}return correct}
  const r=await request('/daily-practice-answer',{runId:run!.id,taskId:task.id,answer,eventId:crypto.randomUUID()});
  if(!alive.current)return Boolean(r.correct);
  if(r.correct&&mode==='gogo')setFeeding({step:done.length,id:crypto.randomUUID()});setRun(r);return Boolean(r.correct);
 }
 const challenge=task?<Challenge key={task.id} task={task} submit={submit}/>:<p>⭐ All challenges finished!</p>;
 if(mode==='gogo')return withArtwork(<GogoPractice completed={done.length} total={run.tasks.length} feeding={feeding} onFed={()=>setFeeding(null)} onExit={onExit} challenge={challenge}/>);
 return <WordReactor vocabulary={words} progress={{}} onExit={onExit} adventure={{completed:done.length,total:run.tasks.length,challenge}}/>;
}

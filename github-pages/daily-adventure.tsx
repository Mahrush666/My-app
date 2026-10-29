import {useHomeworkTime} from './use-homework-time';
import {useEffect,useMemo,useState} from 'react';
import WordReactor from '../app/word-reactor';
import {speak,stopSpeaking} from '../app/words';
import {publicAsset} from '../lib/public-runtime';
import {shuffle} from '../lib/random';
import type {DailyRun,DailyTask} from '../lib/daily-practice';
import FinishCelebration from '../app/finish-celebration';
import {playAnswerSound} from '../lib/audio';
function Challenge({task,submit}:{task:DailyTask;submit:(answer:string)=>Promise<boolean>}){
 const [selected,setSelected]=useState(''),[chosen,setChosen]=useState<number[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');const build=task.kind==='letters'||task.kind==='sentence';
 const tiles=useMemo(()=>shuffle((task.kind==='letters'?[...task.expected]:task.expected.split(' ')).map((text,id)=>({text,id}))),[task]);
 useEffect(()=>()=>stopSpeaking(),[]);
 async function check(){if(busy)return;setBusy(true);try{const ok=await submit(build?chosen.map(i=>tiles[i].text).join(task.kind==='letters'?'':' '):selected);playAnswerSound(ok);if(!ok)setMessage('Listen and try again. 听一听，再试一次。')}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}
 return <div className="daily-challenge"><h3>{task.prompt}</h3>{task.image&&<img className="daily-prompt" src={publicAsset(task.image)} alt=""/>}{task.listen&&<button aria-label="Listen to the question" onClick={()=>speak(task.listen!)}>🔊 Listen 听一听</button>}{build?<><div className="sentence-slots">{chosen.map((n,i)=><button disabled={busy} key={i} onClick={()=>setChosen(c=>c.slice(0,i))}>{tiles[n].text===' '?'␣':tiles[n].text}</button>)}{!chosen.length&&<span>___ ___ ___</span>}</div><div className="spelling-tiles sentence-tiles">{tiles.map((t,i)=><button key={t.id} disabled={busy||chosen.includes(i)} onClick={()=>setChosen(c=>[...c,i])}>{t.text===' '?'␣':t.text}</button>)}</div><button disabled={busy||!chosen.length} onClick={()=>setChosen(c=>c.slice(0,-1))}>Undo 撤销</button></>:<div className={'daily-options '+(task.kind==='pictures'?'daily-pictures':'')}>{task.options?.map(o=><button key={o.id} disabled={busy} aria-label={task.kind==='audio-options'?'Listen to option '+(task.options!.indexOf(o)+1):task.kind==='pictures'?'Choose picture '+(task.options!.indexOf(o)+1):undefined} aria-pressed={selected===o.text} onClick={()=>{setSelected(o.text);setMessage('');if(task.kind!=='pictures')speak(o.text)}}>{task.kind==='pictures'?<img src={publicAsset(o.image!)} alt=""/>:task.kind==='audio-options'?'🔊 '+(task.options!.indexOf(o)+1):o.text}</button>)}</div>}<p role="status">{message}</p><button className="primary" disabled={busy||(build?chosen.length!==tiles.length:!selected)} onClick={()=>void check()}>{busy?'Saving…':'OK ✓'}</button></div>
}
export default function DailyAdventure({request,onExit,childId}:{childId?:string;request:(path:string,data:object)=>Promise<any>;onExit:()=>void}){
 const [run,setRun]=useState<DailyRun|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[replay,setReplay]=useState(false),[replayDone,setReplayDone]=useState<string[]>([]);
 useEffect(()=>{let alive=true;request('/daily-practice',{}).then(r=>{if(alive)setRun(r)}).catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[retry]);
 const activeTask=run?.tasks?.find(t=>!(run.done||[]).includes(t.id));
 useHomeworkTime({childId:childId||'',assignmentId:activeTask?.assignmentId,version:activeTask?.assignmentVersion,enabled:Boolean(childId&&run&&!run.finished&&!replay),request});
 const words=useMemo(()=>(run?.tasks||[]).map(t=>({id:t.id,en:t.expected,zh:'',icon:'',sentence:t.expected,category:'Daily adventure',picture:t.image})),[run?.id]);
 if(error)return <section className="panel"><p role="alert">{error}</p><button onClick={()=>{setError('');setRetry(n=>n+1)}}>Try again 重试</button></section>;
 if(!run)return <p>Preparing your adventure… 正在准备冒险…</p>;
 if(!run.enabled||!run.tasks?.length)return <section className="panel"><p>{run.message||'Daily practice is turned off for this class. 这个班级尚未开启每日练习。'}</p><button onClick={onExit}>Dashboard 主页</button></section>;
 if(run.finished&&(!replay||replayDone.length>=run.tasks.length))return <section className="panel"><FinishCelebration title="Today’s adventure finished! 今日冒险完成！"/><h2>Today’s practice finished! 今日练习已完成！</h2><p>⭐ Great work! See you tomorrow. 做得好，明天见！</p><button onClick={()=>{setReplayDone([]);setReplay(true)}}>Practise again 再练习</button><button className="primary" onClick={onExit}>Dashboard 主页</button></section>;
 const done=replay?replayDone:run.done||[],task=run.tasks.find(t=>!done.includes(t.id));
 return <WordReactor vocabulary={words} progress={{}} onExit={onExit} adventure={{completed:done.length,total:run.tasks.length,challenge:task?<Challenge key={task.id} task={task} submit={async(answer)=>{if(replay){const ok=answer===task.expected;if(ok)setReplayDone(d=>[...d,task.id]);return ok}const r=await request('/daily-practice-answer',{runId:run.id,taskId:task.id,answer,eventId:crypto.randomUUID()});setRun(r);return r.correct}}/>:<p>⭐ All challenges finished!</p>}}/>;
}

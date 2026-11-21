import {useEffect,useRef,useState,type ReactNode} from 'react';
import {DoorOpen,MapPin,RotateCcw,Maximize,Minimize} from 'lucide-react';
import {publicAsset} from '../lib/public-runtime';
import {prepareAnswerSounds,stopSpeaking} from '../lib/audio';
import './dungeon-adventure.css';
type Encounter={title:string;kind:string};
export default function DungeonAdventure({completed,total,onExit,renderChallenge}:{completed:number;total:number;onExit:()=>void;renderChallenge:(onResult:(correct:boolean)=>void)=>ReactNode}){
 const frame=useRef<HTMLIFrameElement>(null),token=useRef(crypto.randomUUID()),dialog=useRef<HTMLDivElement>(null),container=useRef<HTMLElement>(null);
 const [expanded,setExpanded]=useState(false);
 const progress=useRef({completed,total});progress.current={completed,total};
 const [height,setHeight]=useState<number|undefined>(),[started,setStarted]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[encounter,setEncounter]=useState<Encounter|null>(null);
 function send(type:string,extra:Record<string,unknown>={}){frame.current?.contentWindow?.postMessage({channel:'wordquest-dungeon',token:token.current,type,...extra},'*')}
 useEffect(()=>{
  const receive=(event:MessageEvent)=>{
   const data=event.data;if(event.source!==frame.current?.contentWindow||!data||data.channel!=='wordquest-dungeon')return;
   if(data.type==='ready'){send('init',progress.current);return;}
   if(data.type==='asset-error'){setError('The dungeon pictures could not load. Try again. 地牢图片加载失败，请重试。');return;}
   if(data.token!==token.current)return;
   if(data.type==='size'&&Number.isFinite(data.height))setHeight(Math.max(300,Math.min(1000,data.height)));
   if(data.type==='initialized'){setReady(true);setError('')}
   if(data.type==='challenge')setEncounter({title:typeof data.title==='string'?data.title:'Dungeon challenge',kind:typeof data.kind==='string'?data.kind:'Challenge'});
   if(data.type==='restarted')setEncounter(null);
   if(data.type==='exit-fullscreen')void closeFullscreen();
  };
  window.addEventListener('message',receive);return()=>{window.removeEventListener('message',receive);stopSpeaking()};
 },[]);
 async function closeFullscreen(){if(document.fullscreenElement===container.current)try{await document.exitFullscreen()}catch{}setExpanded(false)}
 async function toggleFullscreen(){if(expanded){await closeFullscreen();return;}try{await container.current?.requestFullscreen();}catch{}setExpanded(true)}
 useEffect(()=>{
  const changed=()=>setExpanded(document.fullscreenElement===container.current);
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')void closeFullscreen()};
  document.addEventListener('fullscreenchange',changed);window.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('fullscreenchange',changed);window.removeEventListener('keydown',escape)};
 },[]);
 useEffect(()=>{if(!expanded)return;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=overflow}},[expanded]);
 useEffect(()=>{if(ready)send('viewport',{expanded})},[expanded,ready]);
 useEffect(()=>{if(ready)send('progress',{completed,total})},[completed,total,ready]);
 useEffect(()=>{if(encounter)dialog.current?.focus()},[encounter]);
 useEffect(()=>{if(!started||ready)return;const timer=setTimeout(()=>setError('The dungeon is taking longer to load. Try again. 地牢加载较慢，请重试。'),20000);return()=>clearTimeout(timer)},[started,ready,attempt]);
 function retry(){setReady(false);setError('');setEncounter(null);setAttempt(n=>n+1)}
 function result(correct:boolean){send('result',{correct});if(correct)setEncounter(null)}
 return <section ref={container} className={'dungeon-adventure'+(expanded?' dungeon-expanded':'')}><header className="dungeon-header"><div><h3><DoorOpen size={21}/>Word Dungeon 单词地牢</h3><span>{completed} / {total} complete · 已完成</span></div><div className="dungeon-header-actions"><button onClick={()=>void toggleFullscreen()} aria-label={expanded?'Exit fullscreen':'Fullscreen'} title={expanded?'Exit fullscreen 退出全屏':'Fullscreen 全屏'}>{expanded?<Minimize size={19}/>:<Maximize size={19}/>}<span>{expanded?'Exit fullscreen':'Fullscreen'}</span></button><button onClick={()=>{void closeFullscreen();onExit()}}>Exit 返回</button></div></header>
 {!started?<div className="dungeon-welcome"><img src={publicAsset('games/dungeon/cover.webp')} alt="Dungeon guardian"/><h2>Open doors. Meet the guardians.</h2><p>Explore the maze and answer your lesson questions.<br/>探索迷宫，回答本课问题，打开通道。</p><button className="primary" onClick={()=>{prepareAnswerSounds();setStarted(true)}}>Start adventure 开始冒险</button></div>:<>
 {error?<div className="dungeon-error" role="alert"><p>{error}</p><button onClick={retry}><RotateCcw size={17}/>Try again 重试</button></div>:!ready&&<p className="dungeon-loading" role="status">Opening the dungeon… 正在打开地牢…</p>}
 <div className="dungeon-world" hidden={Boolean(error)}><iframe key={attempt} ref={frame} src={publicAsset('games/dungeon/world.html?v=20261121-map-fullscreen')} sandbox="allow-scripts" style={{height}} title="Word Dungeon maze" tabIndex={encounter?-1:0}/>
 {encounter&&<div className="dungeon-question-overlay"><div ref={dialog} className="dungeon-question" role="dialog" aria-modal="true" aria-label={encounter.title} tabIndex={-1}><div className="dungeon-encounter-heading"><div><small>{encounter.kind}</small><h3>{encounter.title}</h3></div><button onClick={()=>{stopSpeaking();send('cancel');setEncounter(null)}}>Explore 探索</button></div>{renderChallenge(result)}</div></div>}
 </div><div className="dungeon-tools"><button className="primary" disabled={!ready||Boolean(error)||Boolean(encounter)} onClick={()=>send('find')}><MapPin size={18}/>Find a challenge 寻找挑战</button><button disabled={Boolean(encounter)} onClick={retry}><RotateCcw size={17}/>New maze 新迷宫</button></div><p className="dungeon-instructions">Swipe on the maze: ↑ forward · ↓ back · ← turn left · → turn right. You can also use the arrow buttons or WASD. Tap Interact near a guard or door, or “Find a challenge”.<br/>在迷宫画面滑动：↑前进 · ↓后退 · ←左转 · →右转。也可用方向按钮探索，点击互动或“寻找挑战”。</p>
 </>}
 </section>;
}

import {useEffect,useRef,useState,type ReactNode} from 'react';
import {publicAsset} from '../lib/public-runtime';
import media from '../public/mascots/gogo/manifest.json';

// Eleven growth transitions plus a little cookie snack make twelve feeds.
// The final pancake transition always belongs to the twelfth correct answer.
export const gogoMeals=['pizza','hamburger','icecream','sock','cake','cookie','hotdog','shoe','doughnut','watermelon','broccoli','pancakes'] as const;
type Meal=typeof gogoMeals[number];
export function gogoStage(completed:number){return Math.min(12,1+Math.min(completed,5)+Math.max(0,completed-6))}
const still=(completed:number)=>publicAsset(`mascots/gogo/stage-${String(gogoStage(completed)).padStart(2,'0')}.webp`);
const animation=(meal:Meal)=>meal==='cookie'?undefined:publicAsset(`mascots/gogo/${meal}.webp`);

function Feeding({step,onFed}:{step:number;onFed:()=>void}){
 const meal=gogoMeals[Math.min(step,11)],src=animation(meal);
 const [url,setUrl]=useState(''),[playing,setPlaying]=useState(false),[fallback,setFallback]=useState(meal==='cookie');
 const callback=useRef(onFed);callback.current=onFed;
 const reduced=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(()=>{
  if(!src||reduced)return;
  const controller=new AbortController();let objectUrl='',alive=true;
  const timeout=setTimeout(()=>{controller.abort();if(alive)setFallback(true)},8000);
  // A fresh object URL restarts cached, play-once WebP animations during replay.
  fetch(src,{cache:'force-cache',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Animation unavailable');return r.blob()}).then(blob=>{if(alive){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl)}}).catch(()=>{if(alive)setFallback(true)}).finally(()=>clearTimeout(timeout));
  return()=>{alive=false;clearTimeout(timeout);controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl)};
 },[src,reduced]);
 useEffect(()=>{
  if(!playing&&!fallback&&!reduced)return;
  const duration=reduced?650:fallback?1500:media[meal as keyof typeof media].durationMs;
  const timer=setTimeout(()=>callback.current(),duration);return()=>clearTimeout(timer);
 },[playing,fallback,reduced,meal]);
 return <div className="gogo-feeding" aria-label="Gogo is enjoying his snack">
  <img className={'gogo-character '+(fallback&&!reduced?'gogo-munch':'')} src={still(step)} alt="" style={{visibility:playing&&!fallback&&!reduced?'hidden':'visible'}}/>
  {url&&!fallback&&!reduced&&<img className="gogo-character gogo-animation" src={url} alt="" onLoad={()=>setPlaying(true)} onError={()=>setFallback(true)}/>}
  {fallback&&!reduced&&<span className="gogo-cookie" aria-hidden="true">🍪</span>}
 </div>;
}

export default function GogoPractice({completed,total,feeding,challenge,onFed,onExit}:{completed:number;total:number;feeding:{step:number;id:string}|null;challenge:ReactNode;onFed:()=>void;onExit:()=>void}){
 const reduced=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(()=>{
  const next=gogoMeals[Math.min(completed,11)],src=animation(next),controller=new AbortController();
  // Only the next meal is downloaded, so opening practice never fetches the set.
  if(src)void fetch(src,{cache:'force-cache',signal:controller.signal}).catch(()=>{});
  const img=new Image();img.src=still(completed);
  return()=>{controller.abort()};
 },[completed]);
 return <section className="gogo-practice" aria-label="Feed Gogo daily practice">
  <header className="gogo-game-header"><h2>Feed Gogo! <small>喂饱咕咕！</small></h2><button className="gogo-exit" onClick={onExit} aria-label="Close daily practice">×</button></header>
  <div className="gogo-progress"><span aria-live="polite">{completed} / {total} <span aria-hidden="true">🍽️</span></span><progress value={completed} max={total} aria-label="Gogo’s fullness"/></div>
  <div className="gogo-scene">
   {feeding?<Feeding key={feeding.id} step={feeding.step} onFed={onFed}/>:<img className="gogo-character gogo-idle" src={!completed&&!reduced?publicAsset('mascots/gogo/idle.webp'):still(completed)} alt={completed?'Gogo is getting fuller and happier':'Hungry Gogo is waiting for a snack'}/>}
   <p className="gogo-caption" role="status">{feeding?'Yum! 好吃！':completed?'Another snack? 再来一口？':'Let’s feed Gogo! 一起来喂咕咕！'}</p>
  </div>
  {feeding?<div className="gogo-feeding-message" role="status">✓ Well done! 答对啦！</div>:<div className="panel gogo-question">{challenge}</div>}
 </section>;
}

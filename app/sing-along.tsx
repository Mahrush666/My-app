import FinishCelebration from './finish-celebration';
"use client";
import {useEffect,useRef,useState} from 'react';
import type {LessonVideo} from '@/lib/lesson-video';
import {publicAsset} from '@/lib/public-runtime';
import {stopSpeaking} from './words';
export default function SingAlong({videos}:{videos:LessonVideo[]}){
 const [ended,setEnded]=useState<string[]>([]);
 const [index,setIndex]=useState(0),[error,setError]=useState(false),[playing,setPlaying]=useState(false);
 const player=useRef<HTMLMediaElement|null>(null),clip=videos[index];
 useEffect(()=>{const media=player.current;return()=>{media?.pause()}},[index]);
 if(!clip)return null;
 return <section className="sing-along">{ended.length===videos.length&&<FinishCelebration/>}<p className="eyebrow">{clip.audioOnly?'LISTEN & LEARN 听音学一学':clip.kind==='story'?'WATCH THE STORY 看故事':clip.kind==='lesson'?'WATCH & LEARN 看视频学一学':'WATCH & SING 看视频唱一唱'}</p><h2>{clip.title}</h2><p>{clip.audioOnly?'Listen and repeat. 听一听，跟着说。':clip.kind?'Watch and listen. 看一看，听一听。':'🎵 Watch, sing and do the actions! 看一看，唱一唱，做动作。'}</p>
 {videos.length>1&&<div className="video-choices">{videos.map((v,i)=><button key={v.src} aria-pressed={index===i} onClick={()=>{player.current?.pause();setError(false);setIndex(i)}}>{v.audioOnly?'🎧':v.kind==='song'?'🎵':'▶'} {v.title}</button>)}</div>}
 <button className="primary" aria-label={playing?(clip.audioOnly?"Pause audio":"Pause video"):(clip.audioOnly?"Play audio":"Play video")} onClick={()=>{stopSpeaking();setError(false);if(playing)player.current?.pause();else void player.current?.play().catch(()=>setError(true))}}>{playing?"⏸ Pause 暂停":"▶ Play 播放"}</button>
 {clip.audioOnly?<><img className="lesson-audio-art" src={clip.poster?publicAsset(clip.poster):undefined} alt={clip.title}/><audio key={clip.src} ref={el=>{player.current=el}} controls preload="none" src={publicAsset(clip.src)} onPlay={()=>{stopSpeaking();setPlaying(true)}} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);setEnded(old=>[...new Set([...old,clip.src])])}} onError={()=>setError(true)}/></>:<video key={clip.src} ref={el=>{player.current=el}} controls playsInline preload="none" src={publicAsset(clip.src)} poster={clip.poster?publicAsset(clip.poster):undefined} onPlay={()=>{stopSpeaking();setPlaying(true)}} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);setEnded(old=>[...new Set([...old,clip.src])])}} onError={()=>setError(true)}/>}

 {error&&<p role="alert">This recording could not load. Please reopen the lesson and try Play again. 暂时无法加载，请重新打开课程再播放。</p>}
 <p className="small-note">{clip.audioOnly?"Tap ▶ to listen. 点击播放听录音。":"Tap ▶ to play. Use the player’s fullscreen button for a larger picture. 点击播放，或点击播放器的全屏按钮。"}</p></section>
}

"use client";
import {useEffect,useRef,useState} from 'react';
import type {LessonVideo} from '@/lib/lesson-video';
import {publicAsset} from '@/lib/public-runtime';
import {stopSpeaking} from './words';
export default function SingAlong({videos}:{videos:LessonVideo[]}){
 const [index,setIndex]=useState(0),[error,setError]=useState(false),[playing,setPlaying]=useState(false);
 const player=useRef<HTMLVideoElement|null>(null),clip=videos[index];
 useEffect(()=>{const media=player.current;return()=>{media?.pause()}},[index]);
 if(!clip)return null;
 return <section className="sing-along"><p className="eyebrow">WATCH & SING 看视频唱一唱</p><h2>{clip.title}</h2><p>🎵 Watch, sing and do the actions! 看一看，唱一唱，做动作。</p>
 <div className="video-choices">{videos.map((v,i)=><button key={v.src} aria-pressed={index===i} onClick={()=>{player.current?.pause();setError(false);setIndex(i)}}>{i===0?'🐸':'🎵'} {v.title}</button>)}</div>
 <button className="primary" aria-label={playing?"Pause video":"Play video"} onClick={()=>{stopSpeaking();setError(false);if(playing)player.current?.pause();else void player.current?.play().catch(()=>setError(true))}}>{playing?"⏸ Pause 暂停":"▶ Play 播放"}</button>
 <video key={clip.src} ref={player} controls playsInline preload="none" src={publicAsset(clip.src)} poster={clip.poster?publicAsset(clip.poster):undefined} onPlay={()=>{stopSpeaking();setPlaying(true)}} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError(true)}/>
 {error&&<p role="alert">The video could not load. Please reopen the lesson and try Play again. 视频无法加载，请重新打开课程再播放。</p>}
 <p className="small-note">Tap ▶ to play. Use the player’s fullscreen button for a larger picture. 点击播放，或点击播放器的全屏按钮。</p></section>
}

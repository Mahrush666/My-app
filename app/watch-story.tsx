"use client";
import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Play,Pause,RotateCcw,Images} from 'lucide-react';
import {publicAsset} from '@/lib/public-runtime';
import {stopSpeaking} from './words';
import type {PictureStory} from '@/lib/picture-story';
export default function WatchStory({story}:{story:PictureStory}){
 const [index,setIndex]=useState(0),[overview,setOverview]=useState(false),[playing,setPlaying]=useState(false),[waiting,setWaiting]=useState(false),[error,setError]=useState('');
 const audio=useRef<HTMLAudioElement|null>(null),scene=story.scenes[index];
 useEffect(()=>{const player=audio.current;return()=>{player?.pause();stopSpeaking()}},[]);
 async function play(restart=false){const a=audio.current;if(!a)return;stopSpeaking();setError('');setWaiting(true);if(restart){a.currentTime=0;setIndex(0);setOverview(false)}try{await a.play()}catch{setWaiting(false);setError('Tap the audio player’s play button below. 请点击下方播放器的播放按钮。')}}
 function move(next:number){setOverview(false);setIndex(Math.max(0,Math.min(story.scenes.length-1,next)))}
 return <section className="watch-story"><div className="quiz-top"><div><p className="eyebrow">WATCH & LISTEN 看图听故事</p><h2>{story.title}</h2></div><span>{overview?'👀':`${index+1} / ${story.scenes.length}`}</span></div>
 <p className="story-guide">👀 + 🔊 <span>Listen to the story. Use the arrows to explore the pictures. 看图听故事，点击箭头换图。</span></p>
 {overview?<div className="story-overview"><img src={publicAsset(story.image)} fetchPriority="high" decoding="async" alt={story.title+' illustrated story page'}/></div>:<div className="story-scene" style={{aspectRatio:`${scene.width} / ${scene.height}`}}><img src={publicAsset(story.image)} fetchPriority="high" decoding="async" alt={scene.label} draggable={false} style={{width:`${story.width/scene.width*100}%`,height:`${story.height/scene.height*100}%`,left:`${-scene.x/scene.width*100}%`,top:`${-scene.y/scene.height*100}%`}}/></div>}
 <div className="story-picture-controls"><button aria-label="Previous picture" disabled={!overview&&index===0} onClick={()=>move(index-1)}><ChevronLeft size={32}/></button><button aria-label={overview?'Show large picture':'Show all story pictures'} aria-pressed={overview} onClick={()=>setOverview(!overview)}><Images size={28}/><span>{overview?'🔍':'👀'}</span></button><button aria-label="Next picture" disabled={!overview&&index===story.scenes.length-1} onClick={()=>move(index+1)}><ChevronRight size={32}/></button></div>
 <div className="story-play-controls"><button className="primary" aria-label={playing?'Pause story':'Play story'} onClick={()=>playing?audio.current?.pause():void play()}>{playing?<Pause size={32}/>:<Play size={32}/>}<span>{waiting?'Loading… 加载中':playing?'Pause 暂停':'Play 播放'}</span></button><button aria-label="Replay story from the beginning" onClick={()=>void play(true)}><RotateCcw size={28}/>Replay 重播</button></div>
 <audio ref={audio} controls preload="none" src={publicAsset(story.audio)} onPlay={()=>{stopSpeaking();setPlaying(true);setError('')}} onWaiting={()=>setWaiting(true)} onPlaying={()=>setWaiting(false)} onPause={()=>{setPlaying(false);setWaiting(false)}} onEnded={()=>{setPlaying(false);setWaiting(false)}} onError={()=>{setPlaying(false);setWaiting(false);setError('Could not load the story audio. Please try opening this lesson again. 音频无法加载，请重新打开课程。')}}/>
 {error&&<p role="alert" className="notice">{error}</p>}<p className="small-note">Original audio from your lesson PPT. It plays the full story while you change pictures. 课件原声完整播放，图片可以手动切换。</p>
 </section>
}

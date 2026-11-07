"use client";
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {lessonMediaFiles,type LessonMedia} from '../lib/lesson-media';
import {practiceStartDelayMs,preloadLessonMedia,type LoadProgress} from '../lib/preload-lesson-media';
import {releaseMedia} from '../lib/media-memory';
import './lesson-assets.css';
export default function LessonAssets({lesson,children,onReady}:{lesson:LessonMedia;children:ReactNode;onReady?:(ready:boolean)=>void}){
 const key=JSON.stringify(lessonMediaFiles(lesson));
 const files=useMemo(()=>JSON.parse(key) as ReturnType<typeof lessonMediaFiles>,[key]);
 const callback=useRef(onReady);callback.current=onReady;
 const [state,setState]=useState<LoadProgress>({loaded:0,total:files.length,failed:0}),[readyKey,setReadyKey]=useState('');
 useEffect(()=>{
  const controller=new AbortController(),user=Symbol('lesson media');setReadyKey('');
  const timer=setTimeout(()=>setReadyKey(key),practiceStartDelayMs);
  void preloadLessonMedia(files,user,controller.signal,setState).then(()=>{
   clearTimeout(timer);
   if(!controller.signal.aborted)setReadyKey(key);
  });
  return()=>{clearTimeout(timer);controller.abort();releaseMedia(user)};
 },[files,key]);
 const ready=readyKey===key;
 useEffect(()=>{callback.current?.(ready);return()=>{if(ready)callback.current?.(false)}},[key,ready]);
 if(ready)return <>{children}</>;
 const completed=state.loaded+state.failed;
 return <section className="lesson-assets" aria-label="Loading lesson" aria-busy="true">
  <span className="lesson-assets-icon" aria-hidden="true">🎒</span>
  <h3>Getting your lesson ready… 课程准备中…</h3>
  <progress max={state.total||1} value={completed} aria-label="Lesson download progress"/>
  <p>Pictures and sounds can keep loading while you practise. 练习时会继续加载图片和音频。</p>
  <button type="button" onClick={()=>setReadyKey(key)}>Start now 开始练习</button>
 </section>
}

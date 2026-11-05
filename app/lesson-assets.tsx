"use client";
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {lessonMediaFiles,type LessonMedia} from '../lib/lesson-media';
import {preloadLessonMedia,type LoadProgress} from '../lib/preload-lesson-media';
import {releaseMedia} from '../lib/media-memory';
import './lesson-assets.css';
export default function LessonAssets({lesson,children,onReady}:{lesson:LessonMedia;children:ReactNode;onReady?:(ready:boolean)=>void}){
 const key=JSON.stringify(lessonMediaFiles(lesson));
 const files=useMemo(()=>JSON.parse(key) as ReturnType<typeof lessonMediaFiles>,[key]);
 const callback=useRef(onReady);callback.current=onReady;
 const [state,setState]=useState<LoadProgress>({loaded:0,total:files.length,failed:0}),[readyKey,setReadyKey]=useState(''),[attempt,setAttempt]=useState(0),[finished,setFinished]=useState(false);
 useEffect(()=>{
  const controller=new AbortController(),user=Symbol('lesson media');setReadyKey('');setFinished(false);callback.current?.(false);
  void preloadLessonMedia(files,user,controller.signal,setState).then(result=>{
   if(controller.signal.aborted)return;
   setFinished(true);if(!result.failed){setReadyKey(key);callback.current?.(true)}
  });
  return()=>{controller.abort();releaseMedia(user);callback.current?.(false)};
 },[files,key,attempt]);
 if(readyKey===key)return <>{children}</>;
 const percent=state.total?Math.floor(state.loaded/state.total*100):0;
 return <section className="lesson-assets" aria-label="Loading lesson" aria-busy={!finished}>
  <span className="lesson-assets-icon" aria-hidden="true">🎒</span>
  <h3>{finished?'Let’s try loading again 再试一次':'Getting your lesson ready… 课程准备中…'}</h3>
  <progress max={state.total||1} value={state.loaded} aria-label="Lesson download progress"/>
  <p role="status" aria-live="polite">{percent}% · {state.loaded} / {state.total}</p>
  <p>{finished?'Some pictures or sounds could not load. Check your connection and try again. 部分图片或音频未能加载，请检查网络后重试。':'Loading pictures and sounds for smooth practice. 正在加载图片和音频，让练习更流畅。'}</p>
  {finished&&<div className="lesson-assets-actions"><button type="button" className="primary" onClick={()=>setAttempt(n=>n+1)}>Try again 重试</button><button type="button" onClick={()=>{setReadyKey(key);callback.current?.(true)}}>Continue with what’s ready 先开始练习</button></div>}
 </section>
}

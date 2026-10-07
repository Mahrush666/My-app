"use client";
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
export default function AudioFeedback(){
 const [error,setError]=useState<{message:string;src?:string}|null>(null);
 useEffect(()=>{const show=(event:Event)=>setError((event as CustomEvent).detail);const clear=()=>setError(null);window.addEventListener('wordquest-audio-error',show);window.addEventListener('wordquest-audio-clear',clear);return()=>{window.removeEventListener('wordquest-audio-error',show);window.removeEventListener('wordquest-audio-clear',clear)}},[]);
 return error?createPortal(<aside className="audio-notice" role="alert"><p>{error.message}</p>{error.src&&<audio controls src={error.src} preload="metadata"/>}<button onClick={()=>setError(null)} aria-label="Dismiss audio message">Close 关闭</button></aside>,document.fullscreenElement||document.body):null;
}

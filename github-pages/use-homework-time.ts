import {useEffect,useRef} from 'react';
import {ActiveHomeworkClock} from '../lib/homework-time';
type Pending={id:string;sessionId:string;start:number;end:number};
export function useHomeworkTime({childId,assignmentId,version,enabled,request}:{childId:string;assignmentId?:string;version?:number;enabled:boolean;request:(path:string,data:object)=>Promise<unknown>}){
 const api=useRef(request);api.current=request;
 useEffect(()=>{
 if(!assignmentId||!version)return;
 const key='wordquest-active-time:'+childId+':'+assignmentId+':'+version,clock=new ActiveHomeworkClock(Date.now());let sessionId=crypto.randomUUID(),lastInteraction=Date.now(),queue:Pending[]=[];
 try{queue=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
 let writing=false;
 const persist=()=>{try{if(queue.length)localStorage.setItem(key,JSON.stringify(queue));else localStorage.removeItem(key)}catch{}};
 const send=async()=>{if(writing||!queue.length)return;writing=true;try{while(queue.length){const batch=queue.slice(0,60);await api.current('/homework-time',{childId,assignmentId,version,intervals:batch});const ids=new Set(batch.map(x=>x.id));queue=queue.filter(x=>!ids.has(x.id));persist()}}catch{/* Saved locally for the next visit or heartbeat. */}finally{writing=false}};
 if(!enabled){void send();return;}
 const collect=()=>{for(const interval of clock.flush(Date.now()))queue.push({...interval,id:crypto.randomUUID(),sessionId});persist();void send()};
 const renew=()=>{const now=Date.now();if(now-lastInteraction>60000){collect();sessionId=crypto.randomUUID()}lastInteraction=now};
 const activity=()=>{renew();clock.activity(Date.now())};
 const foreground=()=>{if(document.visibilityState!=='hidden')renew();clock.setForeground(document.visibilityState!=='hidden',Date.now());collect()};
 const blur=()=>{clock.setForeground(false,Date.now());collect()};
 const focus=()=>{renew();clock.setForeground(document.visibilityState!=='hidden',Date.now())};
 const hide=()=>{clock.setForeground(false,Date.now());collect()};
 clock.setForeground(document.visibilityState!=='hidden',Date.now());
 for(const event of ['pointerdown','pointermove','keydown','scroll'])document.addEventListener(event,activity,{passive:true,capture:true});
 document.addEventListener('visibilitychange',foreground);window.addEventListener('blur',blur);window.addEventListener('focus',focus);window.addEventListener('pagehide',hide);window.addEventListener('online',collect);
 const timer=setInterval(()=>{if(document.visibilityState!=='hidden'&&[...document.querySelectorAll('audio,video')].some(el=>{const m=el as HTMLMediaElement;return !m.paused&&!m.ended}))activity();collect()},10000);void send();
 return()=>{clearInterval(timer);clock.setForeground(false,Date.now());collect();for(const event of ['pointerdown','pointermove','keydown','scroll'])document.removeEventListener(event,activity,true);document.removeEventListener('visibilitychange',foreground);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);window.removeEventListener('pagehide',hide);window.removeEventListener('online',collect)};
 },[childId,assignmentId,version,enabled]);
}

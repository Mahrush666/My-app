import {useEffect,useState} from 'react';
import {classroomRequest,configuredEndpoint} from './classroom-client';
import {validateSettings,type Settings} from './unit-activities';
const cacheKey='wordquest-published-lessons-v1';
export function usePublishedLessons(ids:string[],enabled:boolean,poll:boolean){
 const [settings,setSettings]=useState<Settings>(()=>{try{return validateSettings(JSON.parse(localStorage.getItem(cacheKey)||'{}'),ids)}catch{return {}}});
 const [loading,setLoading]=useState(enabled),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!enabled){setLoading(false);return;}
  let alive=true,busy=false;
  async function refresh(){if(busy)return;busy=true;try{const endpoint=await configuredEndpoint();if(!endpoint)throw Error('Classroom is not connected.');const result=await classroomRequest<{settings:Settings}>(endpoint,'/lesson-settings');if(alive){const next=validateSettings(result.settings,ids);setSettings(next);setError('');try{localStorage.setItem(cacheKey,JSON.stringify(next))}catch{}}}catch{if(alive)setError('Could not refresh lesson settings. 暂时无法更新课程设置。')}finally{busy=false;if(alive)setLoading(false)}}
  void refresh();const visible=()=>{if(document.visibilityState==='visible')void refresh()};
  const timer=poll?setInterval(()=>void refresh(),60000):undefined;
  if(poll){window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visible)}
  return()=>{alive=false;if(timer)clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible)};
 },[enabled,poll,retry]);
 return {settings,loading,error,retry:()=>setRetry(n=>n+1),replace:(next:Settings)=>{setSettings(next);try{localStorage.setItem(cacheKey,JSON.stringify(next))}catch{}}};
}

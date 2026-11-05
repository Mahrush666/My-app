import {useEffect,useRef,useState} from 'react';
import {RefreshCw} from 'lucide-react';
import {UiText} from './teacher-language';
import WeekReviewTrack from './week-review-track';
import {addDays} from '../lib/teacher-dashboard';
import type {ClassPractice} from '../lib/class-practice';
import './student-dashboard.css';
import './teacher-class-practice.css';
type Request=<T>(path:string,data?:unknown)=>Promise<T>;
export default function TeacherClassPractice({groupId,name,request,embedded=false}:{groupId:string;name?:string;request:Request;embedded?:boolean}){
 const requestRef=useRef(request);requestRef.current=request;
 const sequence=useRef(0),[data,setData]=useState<ClassPractice|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){const id=++sequence.current;setLoading(true);setError('');try{const next=await requestRef.current<ClassPractice>('/class-practice?group='+encodeURIComponent(groupId));if(id===sequence.current)setData(next)}catch(e){if(id===sequence.current)setError(e instanceof Error?e.message:'Could not load practice.')}finally{if(id===sequence.current)setLoading(false)}}
 useEffect(()=>{setData(null);void load();const refresh=()=>{if(document.visibilityState!=='hidden')void load()};window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);const timer=setInterval(refresh,60000);return()=>{sequence.current++;clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh)}},[groupId]);
 const current=data?.groupId===groupId?data:null;
 return <section className={(embedded?'':'panel ')+'teacher-class-practice'} aria-label="Class weekly practice" aria-busy={loading}>
  <div className="tcp-heading"><h2><UiText text="This week’s practice 本周练习"/>{name&&<small>{name}</small>}</h2><button type="button" disabled={loading} onClick={()=>void load()}><RefreshCw size={14}/><UiText text="Refresh 刷新"/></button></div>
  <p className="small-note"><UiText text="Homework and daily practice count together. Each tick means one day of practice. 作业和每日练习合并统计，每个勾代表一天。"/></p>
  {current&&<p className="small-note">{current.weekStart} – {addDays(current.weekStart,6)} · <UiText text="China time 中国时间"/> · {current.students.filter(s=>s.reviewDays.length).length}/{current.students.length} <UiText text="students practised 已练习学生"/></p>}
  {error&&<p role="alert">{error} <button type="button" disabled={loading} onClick={()=>void load()}><UiText text="Retry 重试"/></button></p>}
  {loading&&!current&&<p role="status"><UiText text="Loading practice… 正在加载练习…"/></p>}
  {current&&!current.students.length&&<p><UiText text="No approved students in this class yet. 此班级暂无已加入学生。"/></p>}
  {current&&<div className="tcp-roster">{current.students.map(s=><article className="tcp-student" key={s.id}>
   <div className="tcp-student-info"><strong>{s.name}</strong><span><b>{s.reviewDays.length}/7</b> <UiText text="practice days 练习天数"/></span><small>{s.weeklyXP} <UiText text="XP this week 本周经验"/> · {s.xp} <UiText text="total XP 总经验"/></small></div>
   <WeekReviewTrack compact weekStart={current.weekStart} today={current.today} days={s.reviewDays} label={s.name+' · weekly practice days'}/>
  </article>)}</div>}
 </section>
}

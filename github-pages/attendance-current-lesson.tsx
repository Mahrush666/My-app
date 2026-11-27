import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import type {CurrentGroupLesson} from '../lib/lesson-planner';
import {chinaDay} from '../lib/teacher-dashboard';
import {UiText,useTeacherText} from './teacher-language';
import './attendance-current-lesson.css';
type Request=<T>(path:string,data?:unknown)=>Promise<T>;
const Context=createContext<{lessons:CurrentGroupLesson[];loading:boolean;error:string;retry:()=>void}>({lessons:[],loading:false,error:'',retry:()=>{}});
export function AttendanceLessonProvider({request,children}:{request:Request;children:ReactNode}){
 const [lessons,setLessons]=useState<CurrentGroupLesson[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const requestRef=useRef(request);requestRef.current=request;
 useEffect(()=>{let live=true,sequence=0;
  async function load(){const current=++sequence;setLoading(true);setError('');try{const result=await requestRef.current<{lessons:CurrentGroupLesson[]}>('/current-lessons');if(live&&current===sequence)setLessons(result.lessons)}catch(e){if(live&&current===sequence){setLessons([]);setError(e instanceof Error?e.message:'Could not load current lessons.')}}finally{if(live&&current===sequence)setLoading(false)}}
  void load();const focus=()=>{void load()};window.addEventListener('focus',focus);return()=>{live=false;window.removeEventListener('focus',focus)};
 },[retry]);
 return <Context.Provider value={{lessons,loading,error,retry:()=>setRetry(n=>n+1)}}>{children}</Context.Provider>;
}
export function AttendanceLessonStatus({context='attendance'}:{context?:'attendance'|'dashboard'}={}){const {error,retry}=useContext(Context);return error?<p className="attendance-topic-error" role="status"><UiText text={context==='dashboard'?"Current topics could not load. The class list is still available. 无法加载当前主题，仍可查看课程列表。":"Current topics could not load. Attendance is still available. 无法加载当前主题，仍可记录出勤。"}/> <button type="button" onClick={retry}><UiText text="Retry 重试"/></button></p>:null}
export default function AttendanceCurrentLesson({groupId}:{groupId:string}){
 const {lessons,loading,error}=useContext(Context),{language,t}=useTeacherText(),lesson=lessons.find(l=>l.groupId===groupId);
 if(error)return null;
 if(!lesson)return <span className="attendance-current-topic is-empty"><UiText text={loading?'Loading topic… 正在加载主题…':'Current lesson not set in planner 备课中尚未设置当前课程'}/></span>;
 const day=Number.isFinite(lesson.changedAt)&&lesson.changedAt>0?chinaDay(lesson.changedAt):'';
 const date=day?new Date(day+'T00:00:00Z').toLocaleDateString(language==='zh'?'zh-CN':'en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'';
 return <span className="attendance-current-topic"><span className="attendance-topic-label"><UiText text="Current 当前"/>:</span><strong>{lesson.book} · <UiText text="Unit 单元"/> {lesson.unit} · {lesson.title||t('Lesson not selected 尚未选择课程')}</strong>{date&&<time dateTime={day} title={t('Date the current lesson was last changed (China time) 当前课程最后更改日期（中国时间）')}><UiText text="Updated 更新"/> {date}</time>}</span>;
}

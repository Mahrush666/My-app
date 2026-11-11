import {useEffect,useRef,useState} from 'react';
import {campusAttendanceStatuses,campusLessonsLimit,type CampusAttendanceMark,type CampusAttendanceRow} from '../lib/campus-attendance';
import {chinaDay} from '../lib/teacher-dashboard';
import {UiText} from './teacher-language';
import './campus-attendance.css';

const labels={
 unmarked:'Not marked 未记录',
 present:'Present 出勤',
 late:'Late 迟到',
 absent:'Absent 缺席',
 excused:'Excused 请假',
};
type Request=<T>(path:string,data?:unknown)=>Promise<T>;

export default function CampusAttendance({campusId,request,canMark,onDirtyChange}:{
 campusId:string;request:Request;canMark:boolean;onDirtyChange:(dirty:boolean)=>void;
}){
 const today=chinaDay();
 const [day,setDay]=useState(today);
 const [rows,setRows]=useState<CampusAttendanceRow[]|null>(null);
 const [drafts,setDrafts]=useState<Record<string,CampusAttendanceMark>>({});
 const [search,setSearch]=useState('');
 const [retry,setRetry]=useState(0);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const requestRef=useRef(request);
 requestRef.current=request;
 const dirtyRef=useRef(onDirtyChange);
 dirtyRef.current=onDirtyChange;
 const path='/campus-attendance?campus='+encodeURIComponent(campusId)+'&day='+encodeURIComponent(day);
 const dirty=Object.keys(drafts).length>0;

 useEffect(()=>{
  let live=true;
  setRows(null);
  setError('');
  setNotice('');
  requestRef.current<{students:CampusAttendanceRow[]}>(path).then(result=>{
   if(live)setRows(result.students);
  }).catch(reason=>{
   if(live)setError(reason instanceof Error?reason.message:'Could not load daily attendance.');
  });
  return()=>{live=false};
 },[path,retry]);
 useEffect(()=>{
  dirtyRef.current(dirty);
  if(!dirty)return;
  const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''};
  window.addEventListener('beforeunload',warn);
  return()=>window.removeEventListener('beforeunload',warn);
 },[dirty]);
 useEffect(()=>()=>dirtyRef.current(false),[]);

 function changeDay(nextDay:string){
  if(!nextDay||nextDay===day||nextDay>today||nextDay<'2020-01-01')return;
  if(dirty&&!confirm('Discard unsaved attendance for this date? 放弃此日期未保存的出勤记录？'))return;
  setDrafts({});
  setRows(null);
  setDay(nextDay);
 }
 function edit(row:CampusAttendanceRow,change:Partial<Pick<CampusAttendanceMark,'status'|'lessons'>>){
  setNotice('');
  setDrafts(current=>{
   const {childId,status,lessons}=row;
   const value={...(current[childId]??{childId,status,lessons}),...change};
   const next={...current};
   if(value.status===status&&value.lessons===lessons)delete next[childId];
   else next[childId]=value;
   return next;
  });
 }
 async function save(){
  if(!canMark||saving||!dirty)return;
  setSaving(true);
  setError('');
  setNotice('');
  try{
   const marks=Object.values(drafts).map(mark=>({...mark,lessons:mark.lessons.trim()}));
   await requestRef.current(path,{marks});
   setRows(current=>current?.map(row=>{
    const draft=drafts[row.childId];
    return draft?{...row,status:draft.status,lessons:draft.lessons.trim()}:row;
   })??null);
   setDrafts({});
   setNotice('Attendance saved 出勤已保存');
  }catch(reason){
   setError(reason instanceof Error?reason.message:'Could not save attendance. Please try again.');
  }finally{setSaving(false)}
 }
 const query=search.trim().toLocaleLowerCase();
 const visible=rows?.filter(row=>(row.name+' '+row.groupName).toLocaleLowerCase().includes(query));

 return <section className="panel campus-attendance">
  <h2><UiText text="HT daily attendance HT 每日出勤"/></h2>
  <div className="campus-attendance-filters">
   <label><UiText text="Date 日期"/><input type="date" value={day} min="2020-01-01" max={today} disabled={saving} onChange={event=>changeDay(event.target.value)}/></label>
   <button type="button" disabled={day===today||saving} onClick={()=>changeDay(today)}><UiText text="Today 今天"/></button>
   <label><UiText text="Find a student 查找学生"/><input type="search" value={search} onChange={event=>setSearch(event.target.value)}/></label>
  </div>
  {!rows&&!error&&<p role="status"><UiText text="Loading attendance… 正在加载出勤…"/></p>}
  {error&&<p role="alert" className="notice">{error}{!rows&&<> <button type="button" onClick={()=>setRetry(value=>value+1)}><UiText text="Retry 重试"/></button></>}</p>}
  {rows&&!rows.length&&<p><UiText text="No students on your HT roster yet. HT 名单中暂无学生。"/></p>}
  {rows?.length&&!visible?.length?<p><UiText text="No students match your search. 未找到匹配的学生。"/></p>:null}
  {!!rows?.length&&<form onSubmit={event=>{event.preventDefault();void save()}}>
   <fieldset disabled={!canMark||saving}>
    <div className="campus-attendance-columns" aria-hidden="true"><span><UiText text="Student 学生"/></span><span><UiText text="Attendance 出勤"/></span><span><UiText text="Classes attended 参加的课程"/></span></div>
    {visible?.map(row=>{
     const value=drafts[row.childId]??row;
     return <div className="campus-attendance-row" key={row.childId}>
      <div className="campus-attendance-student"><strong>{row.name}</strong><small>{row.groupName}</small></div>
      <select aria-label={'Attendance for '+row.name} value={value.status} onChange={event=>edit(row,{status:event.target.value as CampusAttendanceMark['status']})}>
       {campusAttendanceStatuses.map(status=><option key={status} value={status}><UiText text={labels[status]}/></option>)}
      </select>
      <label className="campus-attendance-lessons">
       <span><UiText text="Classes attended 参加的课程"/></span>
       <input aria-label={'Classes attended by '+row.name} value={value.lessons} maxLength={campusLessonsLimit} placeholder="e.g. English, Art" onChange={event=>edit(row,{lessons:event.target.value})}/>
      </label>
     </div>;
    })}
   </fieldset>
   {canMark&&<div className="attendance-savebar">
    <span role="status">{dirty?<UiText text="Unsaved changes 未保存"/>:notice&&<UiText text={notice}/>}</span>
    <button className="primary" disabled={saving||!dirty}>{saving?<UiText text="Saving… 保存中…"/>:<UiText text="Save attendance 保存出勤"/>}</button>
   </div>}
  </form>}
 </section>;
}

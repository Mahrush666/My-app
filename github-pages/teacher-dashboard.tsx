import {emptyLessonReward,lessonHomeworkStatuses,lessonParticipation,lessonRewardPoints,type LessonReward,type LessonRates} from '../lib/reward-program';
import TeacherClassPractice from './teacher-class-practice';
import CampusAttendance from './campus-attendance';
import {UiText} from './teacher-language';
import {useEffect,useRef,useState} from 'react';
import {addDays,chinaDay,weekStart,weeklyProgress,type SchoolGroup,type SchoolChild,type ClassMeeting,type AttendanceMark} from '../lib/teacher-dashboard';
import './teacher-dashboard.css';
type Request=<T>(path:string,data?:unknown)=>Promise<T>;
const dateLabel=(d:string)=>new Date(d+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'});
// Native time pickers follow device locale and can show AM/PM. These selectors always use 00–23.
function Time24({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const [hour,minute]=value.split(':');
 return <span className="time-24"><select aria-label="Hour 小时 (00–23)" value={hour} onChange={e=>onChange(e.target.value+':'+minute)}>{Array.from({length:24},(_,i)=>String(i).padStart(2,'0')).map(h=><option key={h} value={h}>{h}</option>)}</select><span aria-hidden="true">:</span><select aria-label="Minute 分钟 (00–59)" value={minute} onChange={e=>onChange(hour+':'+e.target.value)}>{Array.from({length:60},(_,i)=>String(i).padStart(2,'0')).map(m=><option key={m} value={m}>{m}</option>)}</select></span>
}
function WeekPicker({week,onChange}:{week:string;onChange:(v:string)=>void}){return <div className="week-picker"><button aria-label="Previous week" onClick={()=>onChange(addDays(week,-7))}>‹</button><strong>{dateLabel(week)} – {dateLabel(addDays(week,6))}</strong><button aria-label="Next week" onClick={()=>onChange(addDays(week,7))}>›</button><button onClick={()=>onChange(weekStart(chinaDay()))}><UiText text={"This week 本周"}/></button></div>}
function Bar({done,total}:{done:number;total:number}){const percent=total?Math.round(done/total*100):0;return <div className="completion-bar"><progress value={done} max={total||1} aria-label={`${done} of ${total} exercises completed`}/><span>{total?`${percent}% · ${done}/${total}`:<UiText text={'No answer exercises 暂无答题练习'}/>}</span></div>}
export function AssignmentProgress({groups,children,assignments,reports}:{groups:SchoolGroup[];children:SchoolChild[];assignments:Parameters<typeof weeklyProgress>[2];reports:Parameters<typeof weeklyProgress>[3]}){
 const [week,setWeek]=useState(weekStart(chinaDay()));
 const rows=weeklyProgress(groups,children,assignments,reports,week);
 return <section className="panel"><h2><UiText text={"Weekly homework 每周作业"}/></h2><WeekPicker week={week} onChange={setWeek}/><p className="small-note"><UiText text={"Answer exercises completed · due this week, or saved this week without a due date. 按截止日期统计，本周无截止日期作业按保存日期统计。"}/></p>{!rows.length&&<p>Add a class in Student management first.</p>}{rows.map(g=><details key={g.id} className="progress-class"><summary><strong>{g.name}</strong><Bar done={g.done} total={g.total}/></summary><div className="progress-students">{g.students.length?g.students.map(c=><div key={c.id}><span>{c.name}</span><Bar done={c.done} total={c.total}/></div>):<p><UiText text={"No active students 暂无学生"}/></p>}</div></details>)}</section>
}
type AttendanceProps={groups:SchoolGroup[];children:SchoolChild[];request:Request;initialMeeting?:ClassMeeting;onDirtyChange?:(dirty:boolean)=>void;canMark?:boolean;canSchedule?:boolean;canReward?:boolean};
export function Attendance({htCampusId,...props}:AttendanceProps&{htCampusId?:string}){
 const [mode,setMode]=useState<'daily'|'calendar'>(()=>
  props.groups.some(group=>group.id===props.initialMeeting?.group_id)?'calendar':'daily');
 const dirty=useRef(false);
 function onDirtyChange(value:boolean){
  dirty.current=value;
  props.onDirtyChange?.(value);
 }
 function changeMode(next:typeof mode){
  if(next===mode)return;
  if(dirty.current&&!confirm('Discard unsaved attendance? 放弃未保存的出勤记录？'))return;
  setMode(next);
 }
 if(!htCampusId)return <ScheduledAttendance {...props}/>;
 return <>
  <div className="campus-attendance-mode">
   <button type="button" aria-pressed={mode==='daily'} onClick={()=>changeMode('daily')}><UiText text="Daily attendance 每日出勤"/></button>
   <button type="button" aria-pressed={mode==='calendar'} onClick={()=>changeMode('calendar')}><UiText text="Class calendar 课程日历"/></button>
  </div>
  {mode==='daily'?<CampusAttendance campusId={htCampusId} request={props.request} canMark={props.canMark!==false} onDirtyChange={onDirtyChange}/>:
   <ScheduledAttendance {...props} onDirtyChange={onDirtyChange}/>}
 </>;
}
function ScheduledAttendance({groups,children,request,canMark=true,canSchedule=true,canReward=false,initialMeeting,onDirtyChange}:AttendanceProps){
 const [day,setDay]=useState(initialMeeting?.day||chinaDay()),[week,setWeek]=useState(weekStart(initialMeeting?.day||chinaDay())),[meeting,setMeeting]=useState(initialMeeting?.id||''),[meetings,setMeetings]=useState<ClassMeeting[]>([]),[marks,setMarks]=useState<AttendanceMark[]>([]),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [group,setGroup]=useState(groups[0]?.id||''),[time,setTime]=useState('16:00'),[duration,setDuration]=useState(60),[weeks,setWeeks]=useState(1),[formOpen,setFormOpen]=useState(false),[repeatForever,setRepeatForever]=useState(false),[deleting,setDeleting]=useState(false);
 const [editingTime,setEditingTime]=useState<{id:string;time:string}|null>(null),[timeNotice,setTimeNotice]=useState('');
 const [drafts,setDrafts]=useState<Record<string,Record<string,string>>>({}),[savedNotice,setSavedNotice]=useState('');
 const [rewardDrafts,setRewardDrafts]=useState<Record<string,Record<string,LessonReward>>>({});
 const dirty=[...Object.values(drafts),...Object.values(rewardDrafts)].some(d=>Object.keys(d).length>0);
 const dirtyRef=useRef(onDirtyChange);dirtyRef.current=onDirtyChange;
 useEffect(()=>{dirtyRef.current?.(dirty);const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};if(dirty)window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
 useEffect(()=>()=>dirtyRef.current?.(false),[]);
 const requestRef=useRef(request);requestRef.current=request;const sequence=useRef(0);const scheduleId=useRef('');
 async function load(){const seq=++sequence.current;setLoading(true);try{const d=await requestRef.current<{meetings:ClassMeeting[];marks:AttendanceMark[]}>(`/calendar?from=${week}&to=${addDays(week,6)}`);if(seq===sequence.current){setMeetings(d.meetings);setMarks(d.marks)}}catch(e){if(seq===sequence.current)setError((e as Error).message)}finally{if(seq===sequence.current)setLoading(false)}}
 useEffect(()=>{setMeeting(initialMeeting&&weekStart(initialMeeting.day)===week?initialMeeting.id:'');setError('');setMeetings([]);setMarks([]);void load();return()=>{sequence.current++}},[week]);
 useEffect(()=>{if(!groups.some(g=>g.id===group))setGroup(groups[0]?.id||'')},[groups,group]);
 async function act(fn:()=>Promise<void>){if(busy)return;setBusy(true);setError('');try{await fn();await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function saveAttendance(){
 if(busy||!canMark||!meeting)return;
 const updates=drafts[meeting]||{},rewardUpdates=rewardDrafts[meeting]||{};
 const ids=new Set([...Object.keys(updates),...Object.keys(rewardUpdates)]);
 const entries=[...ids].map(childId=>{
  const previous=marks.find(m=>m.meeting_id===meeting&&m.child_id===childId);
  const status=updates[childId]??previous?.status??'unmarked';
  const reward=rewardUpdates[childId];
  return {childId,status,...(reward?{reward:{...reward,participation:status==='present'||status==='late'?reward.participation:'none' as const}}:{})};
 });
 if(!entries.length)return;
 setBusy(true);setError('');setSavedNotice('');
 try{await requestRef.current('/attendance',{meetingId:meeting,marks:entries});
 setMarks(old=>[...old.filter(m=>m.meeting_id!==meeting||!ids.has(m.child_id)),...entries.map(e=>({meeting_id:meeting,child_id:e.childId,name:children.find(c=>c.id===e.childId)?.name||'',status:e.status as AttendanceMark['status'],reward:e.reward??old.find(m=>m.meeting_id===meeting&&m.child_id===e.childId)?.reward}))]);
 setDrafts(old=>{const next={...old};delete next[meeting];return next});setRewardDrafts(old=>{const next={...old};delete next[meeting];return next;});setSavedNotice('Lesson records saved ✓ 课程记录已保存');
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 function changeWeek(v:string){setWeek(v);setDay(v)}
 const selected=meetings.find(m=>m.id===meeting),daily=meetings.filter(m=>m.day===day);
 const roster=selected?children.filter(c=>(c.group_id===selected.group_id&&c.approved)||marks.some(m=>m.meeting_id===selected.id&&m.child_id===c.id)):[];
 const pending=new Set([...Object.keys(drafts[meeting]||{}),...Object.keys(rewardDrafts[meeting]||{})]).size;
 function markAllPresent(){
  setSavedNotice('');
  setDrafts(old=>({...old,[meeting]:Object.fromEntries(roster
   .filter(child=>marks.find(m=>m.meeting_id===meeting&&m.child_id===child.id)?.status!=='present')
   .map(child=>[child.id,'present']))}));
 }
 return <section className="panel attendance-panel"><div className="section-heading"><h2><UiText text={"Attendance 出勤"}/></h2><button disabled={busy||!groups.length||!canSchedule} onClick={()=>setFormOpen(!formOpen)}><UiText text={"+ Schedule 排课"}/></button></div><fieldset disabled={busy} className="calendar-navigation"><WeekPicker week={week} onChange={changeWeek}/><label className="calendar-date"><UiText text={"Go to date 选择日期"}/><input type="date" value={day} onChange={e=>{if(e.target.value){setDay(e.target.value);setWeek(weekStart(e.target.value));setMeeting('')}}}/></label></fieldset><p className="small-note">{loading?'Loading…':`${meetings.length} classes this week 本周课程`} <UiText text={" · China time 中国时间"}/></p>
 <div className="week-calendar">{Array.from({length:7},(_,i)=>addDays(week,i)).map((d,i)=><button key={d} disabled={busy} aria-pressed={day===d} className={day===d?'selected':''} onClick={()=>{setDay(d);setMeeting('');setDeleting(false)}}><span>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span><strong>{Number(d.slice(-2))}</strong><small>{meetings.filter(m=>m.day===d).length||'—'}</small></button>)}</div>
 {formOpen&&<form className="schedule-form" onSubmit={e=>{e.preventDefault();void act(async()=>{scheduleId.current||=crypto.randomUUID();await requestRef.current('/schedule',{eventId:scheduleId.current,groupId:group,day,time,duration,weeks,repeatForever});scheduleId.current='';setFormOpen(false)})}}><h3>Schedule · {dateLabel(day)}</h3><label><UiText text={"Class 班级"}/><select value={group} onChange={e=>{setGroup(e.target.value);scheduleId.current=''}}>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><fieldset disabled={busy} className="schedule-fields"><label><UiText text={"Time 时间 · 24h"}/><Time24 value={time} onChange={value=>{setTime(value);scheduleId.current=''}}/></label><label><UiText text={"Minutes 分钟"}/><input type="number" min={5} max={480} required value={duration} onChange={e=>{setDuration(Number(e.target.value));scheduleId.current=''}}/></label><label><UiText text={"Repeat 重复"}/><select value={repeatForever?'forever':'limited'} onChange={e=>{setRepeatForever(e.target.value==='forever');scheduleId.current=''}}><option value="limited"><UiText text={"Set number of weeks 指定周数"}/></option><option value="forever"><UiText text={"Every week · no end date 每周重复 · 无结束日期"}/></option></select></label>{!repeatForever&&<label><UiText text={"Number of weeks 周数"}/><input type="number" min={1} max={16} required value={weeks} onChange={e=>{setWeeks(Number(e.target.value));scheduleId.current=''}}/></label>}</fieldset><button className="primary" disabled={busy||!group}><UiText text={"Save schedule 保存"}/></button><p className="small-note"><UiText text={repeatForever?"Repeats every week on this weekday until you stop it. 每周同一天重复，直到您停止。":"1 = this date only; up to 16 weeks. 1为仅当日。"}/></p></form>}
 <div className="daily-classes"><h3>{dateLabel(day)} <UiText text={" · Classes 课程"}/></h3>{!loading&&!daily.length&&<p><UiText text={"No classes scheduled 暂无课程"}/></p>}{daily.map(m=><button key={m.id} disabled={busy} aria-pressed={meeting===m.id} className={meeting===m.id?'selected':''} onClick={()=>{setMeeting(m.id);setDeleting(false)}}><strong>{m.time} · {groups.find(g=>g.id===m.group_id)?.name}</strong><span>{m.duration} min · {marks.filter(a=>a.meeting_id===m.id&&a.status!=='unmarked').length} <UiText text={" marked 已记录"}/>{Object.keys(drafts[m.id]||{}).length>0?<UiText text={' · Unsaved 未保存'}/>:''}</span></button>)}</div>
 {selected&&<div className="attendance-roster"><div className="section-heading"><h3>{groups.find(g=>g.id===selected.group_id)?.name} · {selected.time}</h3><div className="session-actions">{canSchedule&&<button disabled={busy} onClick={()=>{setEditingTime({id:selected.id,time:selected.time});setTimeNotice('')}}><UiText text={"Edit time 修改时间"}/></button>}<button disabled={busy||!canSchedule} onClick={()=>setDeleting(true)}><UiText text={"Remove session 删除课次"}/></button></div></div>{deleting&&<div className="notice" role="dialog" aria-label="Delete class session"><p><UiText text={"Delete this class session and its attendance? 删除课程及其出勤记录？"}/></p><div className="session-actions">{(['one','following'] as const).map(scope=><button key={scope} disabled={busy} onClick={()=>void act(async()=>{await requestRef.current('/delete-meeting',{id:selected.id,scope});setDrafts(old=>{const next={...old};for(const m of meetings)if(m.id===selected.id||(scope==='following'&&m.id.replace(/-\d+$/,'')===selected.id.replace(/-\d+$/,'')&&m.day>=selected.day))delete next[m.id];return next});setDeleting(false);setMeeting('')})}><UiText text={scope==='one'?"This date only 仅此日期":"This and all following weeks 本次及之后所有周"}/></button>)}<button disabled={busy} onClick={()=>setDeleting(false)}><UiText text={"Cancel 取消"}/></button></div></div>}{editingTime?.id===selected.id&&<form className="schedule-form edit-session-time" onSubmit={e=>{e.preventDefault();const edit=editingTime;void act(async()=>{await requestRef.current('/update-meeting',{id:edit.id,time:edit.time});setEditingTime(null);setTimeNotice('Class time updated ✓ 上课时间已更新')})}}><h3><UiText text={"Edit time 修改时间 · "}/>{dateLabel(selected.day)}</h3><fieldset disabled={busy}><label><UiText text={"Time 时间 · 24h"}/><Time24 value={editingTime.time} onChange={time=>setEditingTime({...editingTime,time})}/></label></fieldset><p className="small-note"><UiText text={"This class session only. 仅修改此次课程。"}/></p><div className="session-actions"><button className="primary" disabled={busy||editingTime.time===selected.time}><UiText text={"Save time 保存时间"}/></button><button type="button" disabled={busy} onClick={()=>setEditingTime(null)}><UiText text={"Cancel 取消"}/></button></div></form>}{timeNotice&&<p role="status">{timeNotice}</p>}{canMark&&roster.length>0&&<button type="button" disabled={busy} onClick={markAllPresent}><UiText text="Mark all present 全部出勤"/></button>}
 {!roster.length&&<p>No students in this class.</p>}{roster.map(c=><div key={c.id} className="lesson-attendance-record"><label className="attendance-student"><strong>{c.name}</strong><select disabled={busy||!canMark} aria-label={'Attendance for '+c.name} value={drafts[selected.id]?.[c.id]??marks.find(m=>m.meeting_id===selected.id&&m.child_id===c.id)?.status??'unmarked'} onChange={e=>{const status=e.target.value;setSavedNotice('');setDrafts(old=>{const next={...old,[selected.id]:{...old[selected.id]}};const original=marks.find(m=>m.meeting_id===selected.id&&m.child_id===c.id)?.status||'unmarked';if(status===original)delete next[selected.id][c.id];else next[selected.id][c.id]=status;return next})}}><option value="unmarked"><UiText text={"Not marked 未记录"}/></option><option value="present"><UiText text={"✓ Present 出勤"}/></option><option value="late"><UiText text={"Late 迟到"}/></option><option value="absent"><UiText text={"Absent 缺席"}/></option><option value="excused"><UiText text={"Excused 请假"}/></option></select></label>
 {canReward&&<LessonRewardFields name={c.name}
  status={drafts[selected.id]?.[c.id]??marks.find(m=>m.meeting_id===selected.id&&m.child_id===c.id)?.status??'unmarked'}
  value={rewardDrafts[selected.id]?.[c.id]??marks.find(m=>m.meeting_id===selected.id&&m.child_id===c.id)?.reward??emptyLessonReward}
  rates={selected.rates??{attendance:10,homework:10}} disabled={busy||!canMark}
  onChange={value=>{setSavedNotice('');setRewardDrafts(old=>({...old,[selected.id]:{...old[selected.id],[c.id]:value}}));}}/>}
 </div>)}{canMark&&<div className="attendance-savebar"><span role="status">{pending?`${pending} unsaved changes · 未保存`:savedNotice||<UiText text={'Mark everyone, then save. 标记后统一保存。'}/>}</span><button className="primary" disabled={busy||!pending} onClick={()=>void saveAttendance()}>{busy?<UiText text={'Saving… 保存中…'}/>:<UiText text={'Save lesson records 保存课程记录'}/>}</button></div>}</div>}{dirty&&<p className="small-note"><UiText text={"Unsaved attendance stays here while you switch dates or classes. 出勤更改尚未保存。"}/></p>}{busy&&<p role="status"><UiText text={"Saving… 保存中"}/></p>}{error&&<p role="alert" className="notice">{error} <button disabled={busy} onClick={()=>{setError('');if(pending)void saveAttendance();else void load()}}><UiText text={"Retry 重试"}/></button></p>}{selected&&<TeacherClassPractice key={selected.group_id} groupId={selected.group_id} name={groups.find(g=>g.id===selected.group_id)?.name} request={request} embedded/>}</section>
}

function LessonRewardFields({name,status,value,rates,disabled,onChange}:{name:string;status:string;value:LessonReward;rates:LessonRates;disabled:boolean;onChange:(value:LessonReward)=>void}){
 const present=status==='present'||status==='late',points=lessonRewardPoints(value,rates,present);
 const total=Object.values(points).reduce((sum,n)=>sum+n,0);
 const homeworkLabels=['Not assigned 未布置','Missing 未完成','Partial 部分完成','Completed 已完成'];
 const participationLabels=['None 无','Good 积极参与','Excellent 出色参与'];
 return <details className="lesson-reward-fields">
  <summary aria-label={name+' · lesson points'}><UiText text="Lesson points 课程积分"/> · <strong>{total} XP</strong></summary>
  <fieldset disabled={disabled}>
   <label><UiText text="Offline homework 线下作业"/><select value={value.homework} onChange={event=>onChange({...value,homework:event.target.value as LessonReward['homework']})}>
    {lessonHomeworkStatuses.map((key,i)=><option value={key} key={key}><UiText text={homeworkLabels[i]}/></option>)}
   </select></label>
   <label><UiText text="Participation 课堂参与"/><select disabled={!present} value={present?value.participation:'none'} onChange={event=>onChange({...value,participation:event.target.value as LessonReward['participation']})}>
    {lessonParticipation.map((key,i)=><option value={key} key={key}><UiText text={participationLabels[i]}/></option>)}
   </select></label>
   <label><UiText text="Extra XP 额外积分"/><input type="number" min={-1000} max={1000} step={1} value={value.extra} onChange={event=>{
    const extra=Number(event.target.value);if(Number.isInteger(extra)&&Math.abs(extra)<=1000)onChange({...value,extra});
   }}/></label>
   <label><UiText text="Note 备注"/><input maxLength={240} value={value.note} onChange={event=>onChange({...value,note:event.target.value})}/></label>
  </fieldset>
  <small>{points.attendance} <UiText text="attendance 出勤"/> · {points.homework} <UiText text="offline homework 线下作业"/> · {points.participation} <UiText text="participation 参与"/> · {points.extra} <UiText text="extra 额外"/></small>
 </details>;
}

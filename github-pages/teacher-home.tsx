import {useEffect,useRef,useState} from 'react';
import {ChevronRight,ClipboardPlus} from 'lucide-react';
import {useTeacherText} from './teacher-language';
import {publicAsset} from '../lib/public-runtime';
import type {WeeklyClass} from '../lib/weekly-homework-report';
import {addDays,chinaDay,weekStart,type ClassMeeting,type SchoolGroup,type SchoolChild} from '../lib/teacher-dashboard';
import {homeworkFinished,requiresAnswers} from '../lib/homework-completion';
type Task={id:string;group_id:string;title:string;activities:string;due_date?:string;updated_at:number};
type Report={child_id:string;assignment_id:string;last_seen:number|null;completed:string};
type Section='students'|'attendance'|'assignments'|'reports';
export function recentHomework(groups:SchoolGroup[],children:SchoolChild[],assignments:Task[],reports:Report[],now:number){
 return reports.flatMap(report=>{
  const child=children.find(c=>c.id===report.child_id&&c.approved),task=assignments.find(a=>a.id===report.assignment_id);
  if(!child||!task||child.group_id!==task.group_id||!groups.some(g=>g.id===child.group_id)||!report.last_seen||report.last_seen<Math.max(now-7*86400000,task.updated_at))return [];
  const required=(JSON.parse(task.activities) as string[]).filter(requiresAnswers);
  const completed=(JSON.parse(report.completed) as string[]).map(activity=>({assignment_id:task.id,activity}));
  return [{...report,child,task,finished:required.length>0&&homeworkFinished(task,completed)}];
 }).sort((a,b)=>Number(b.last_seen)-Number(a.last_seen)).slice(0,8);
}
export default function TeacherHome({groups,children,assignments,reports,request,onNavigate,onMeeting,canAssign=true,teacherName}:{groups:SchoolGroup[];children:SchoolChild[];assignments:Task[];reports:Report[];request:<T>(path:string)=>Promise<T>;onNavigate:(section:Section)=>void;onMeeting:(meeting:ClassMeeting)=>void;canMaterials:boolean;canAssign?:boolean;teacherName?:string}){
 const {language,t}=useTeacherText();
 const [meetings,setMeetings]=useState<ClassMeeting[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0),[now,setNow]=useState(Date.now()),[progress,setProgress]=useState<Record<string,number>>({});
 const ref=useRef(request);ref.current=request;
 const today=chinaDay(now),week=weekStart(today);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer)},[]);
 useEffect(()=>{let live=true;setLoading(true);setError('');setMeetings([]);ref.current<{meetings:ClassMeeting[]}>(`/calendar?from=${today}&to=${addDays(today,13)}`).then(d=>{if(live)setMeetings(d.meetings)}).catch(e=>{if(live)setError(e instanceof Error?e.message:'Could not load classes.')}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[today,groups,retry]);
 const start=(m:ClassMeeting)=>Date.parse(m.day+'T'+m.time+':00+08:00');
 const upcoming=meetings.filter(m=>groups.some(g=>g.id===m.group_id)&&start(m)+m.duration*60000>now).sort((a,b)=>start(a)-start(b)).slice(0,3);
 const recent=recentHomework(groups,children,assignments,reports,now).slice(0,3);
 const recentGroups=[...new Set(recent.map(r=>r.child.group_id))].sort().join(',');
 const recentKey=recent.map(r=>r.child_id+':'+r.assignment_id+':'+r.last_seen).join(',');
 useEffect(()=>{
  let live=true;setProgress({});
  if(recentGroups)void Promise.allSettled(recentGroups.split(',').map(group=>ref.current<WeeklyClass>('/weekly-homework-report?group='+encodeURIComponent(group)+'&week='+week))).then(results=>{if(!live)return;const next:Record<string,number>={};for(const result of results)if(result.status==='fulfilled')for(const student of result.value.students||[])for(const assignment of student.assignments)next[student.id+':'+assignment.id]=assignment.progress.percent;setProgress(next)});
  return()=>{live=false};
 },[recentGroups,recentKey,week]);
 const locale=language==='zh'?'zh-CN':'en-GB';
 const dayLabel=(day:string)=>day===today?t('Today'):new Date(day+'T00:00:00Z').toLocaleDateString(locale,{timeZone:'UTC',month:'short',day:'numeric'});
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',hour12:false}).format(now));
 const greeting=t(hour<12?'Good morning':hour<18?'Good afternoon':'Good evening');
 const name=teacherName&&!/^(owner|teacher|teacher account)$/i.test(teacherName)?teacherName:'';
 return <section className="teacher-home compact-teacher-home">
 <header className="teacher-welcome"><div><h1>{greeting}{name?', '+name:'!'}</h1><p>{new Date(now).toLocaleDateString(locale,{timeZone:'Asia/Shanghai',weekday:'long',day:'numeric',month:'long'})}</p></div><img className="teacher-welcome-mascot" src={publicAsset('mascots/gogo/stage-04.webp')} alt="" aria-hidden="true"/></header>
 <div className="academy-stats"><section><strong>{loading?'…':error?'—':meetings.filter(m=>m.day===today&&groups.some(g=>g.id===m.group_id)).length}</strong><span>{t('Classes today')}</span></section><section><strong>{children.filter(c=>c.approved).length}</strong><span>{t('Students active')}</span></section><section title={t('Last 7 days')}><strong>{reports.filter(r=>recentHomework(groups,children,assignments,[r],now).some(a=>a.finished)).length}</strong><span>{t('Homework done')}</span></section></div>
 <div className="teacher-home-grid">
 <section className="teacher-home-section"><div className="section-heading"><h2>{t('Upcoming classes')}</h2><button className="teacher-section-link" onClick={()=>onNavigate('attendance')}>{t('Calendar')} →</button></div>
 <div className="teacher-compact-list">{loading?<p className="teacher-empty" role="status">{t('Loading…')}</p>:error?<p className="teacher-empty" role="alert">{error} <button onClick={()=>setRetry(n=>n+1)}>{t('Retry 重试')}</button></p>:upcoming.length?upcoming.map(m=><button className="teacher-home-row teacher-class-row" key={m.id} onClick={()=>onMeeting(m)}><span className="teacher-row-time"><strong>{m.time}</strong><small>{dayLabel(m.day)}</small></span><span className="teacher-row-copy"><strong>{groups.find(g=>g.id===m.group_id)?.name}</strong><small>{children.filter(c=>c.group_id===m.group_id&&c.approved).length} {t('students')} · {m.duration} {t('min')}{start(m)<=now?' · '+t('In progress 上课中'):''}</small></span><ChevronRight size={18} aria-hidden="true"/></button>):<p className="teacher-empty">{t('No upcoming classes scheduled. 暂无排课。')}</p>}</div></section>
 <section className="teacher-home-section"><div className="section-heading"><h2>{t('Recent homework')}</h2><button className="teacher-section-link" onClick={()=>onNavigate('reports')}>{t('Reports')} →</button></div>
 <div className="teacher-compact-list">{recent.length?recent.map((r,i)=>{const percent=r.finished?100:progress[r.child_id+':'+r.assignment_id];return <button className="teacher-home-row teacher-homework-row" key={r.child_id+r.assignment_id} onClick={()=>onNavigate('reports')}><span className={'teacher-student-initial initial-'+i} aria-hidden="true">{r.child.name.slice(0,1).toUpperCase()}</span><span className="teacher-row-copy"><strong>{r.child.name}</strong><small title={r.task.title}>{r.task.title}</small></span>{percent!==undefined?<span className={'teacher-mini-progress '+(percent>=100?'complete':percent<50?'pending':'')} aria-label={r.child.name+' '+percent+'%'}>{percent>=100?<span>✓ {t('Finished')}</span>:<><progress value={percent} max={100}/><span>{percent}%</span></>}</span>:<span className="teacher-practising">{t('Practising')}</span>}</button>}):<p className="teacher-empty">{t('No homework activity yet this week. 本周暂无作业记录。')}</p>}</div></section>
 </div>
 {canAssign&&<button className="primary teacher-assign-action" onClick={()=>onNavigate('assignments')}><ClipboardPlus size={20}/>{t('Assign homework')}</button>}
 </section>;
}

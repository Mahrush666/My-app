import {useEffect,useRef,useState} from 'react';
import {addDays,chinaDay,type ClassMeeting,type SchoolGroup,type SchoolChild} from '../lib/teacher-dashboard';
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
export default function TeacherHome({groups,children,assignments,reports,request,onNavigate,onMeeting,canMaterials}:{groups:SchoolGroup[];children:SchoolChild[];assignments:Task[];reports:Report[];request:<T>(path:string)=>Promise<T>;onNavigate:(section:Section)=>void;onMeeting:(meeting:ClassMeeting)=>void;canMaterials:boolean}){
 const [meetings,setMeetings]=useState<ClassMeeting[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0),[now,setNow]=useState(Date.now());
 const ref=useRef(request);ref.current=request;
 const today=chinaDay(now);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer)},[]);
 useEffect(()=>{let live=true;setLoading(true);setError('');setMeetings([]);ref.current<{meetings:ClassMeeting[]}>(`/calendar?from=${today}&to=${addDays(today,13)}`).then(d=>{if(live)setMeetings(d.meetings)}).catch(e=>{if(live)setError(e instanceof Error?e.message:'Could not load classes.')}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[today,groups,retry]);
 const start=(m:ClassMeeting)=>Date.parse(m.day+'T'+m.time+':00+08:00');
 const upcoming=meetings.filter(m=>groups.some(g=>g.id===m.group_id)&&start(m)+m.duration*60000>now).sort((a,b)=>start(a)-start(b)).slice(0,5);
 const recent=recentHomework(groups,children,assignments,reports,now).slice(0,4);
 const date=(value:number)=>new Date(value).toLocaleString('en-GB',{timeZone:'Asia/Shanghai',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 return <section className="teacher-home"><div className="section-heading"><h2>Your teaching day 教师主页</h2><span className="small-note">{new Date(now).toLocaleDateString('en-GB',{timeZone:'Asia/Shanghai',weekday:'long',day:'numeric',month:'long'})} · China time</span></div>
 <div className="academy-stats"><section><span>Classes today 今日课程</span><strong>{loading?'…':error?'—':meetings.filter(m=>m.day===today&&groups.some(g=>g.id===m.group_id)).length}</strong></section><section><span>Active students 在读学生</span><strong>{children.filter(c=>c.approved).length}</strong></section><section><span>Finished · last 7 days 近七天完成</span><strong>{reports.filter(r=>recentHomework(groups,children,assignments,[r],now).some(a=>a.finished)).length}</strong></section></div>
 <div className="teacher-home-grid"><section className="panel"><h3>Upcoming classes 接下来的课</h3><p className="small-note">Next 14 days 未来两周</p>{loading?<p role="status">Loading… 加载中…</p>:error?<p role="alert">{error} <button onClick={()=>setRetry(n=>n+1)}>Retry 重试</button></p>:upcoming.length?upcoming.map(m=><button className="teacher-home-row" key={m.id} onClick={()=>onMeeting(m)}><span><strong>{groups.find(g=>g.id===m.group_id)?.name}</strong><small>{date(start(m))} · {m.duration} min{start(m)<=now?' · In progress 上课中':''}</small></span><span aria-hidden="true">→</span></button>):<p>No upcoming classes scheduled. 暂无排课。<button onClick={()=>onNavigate('attendance')}>Open calendar 打开日历</button></p>}</section>
 <section className="panel"><div className="section-heading"><h3>Recent homework 最近作业</h3><button onClick={()=>onNavigate('reports')}>Homework reports 作业报告</button></div><p className="small-note">Last 7 days · time of last practice 最近七天 · 最近练习时间</p>{recent.length?recent.map(r=><button className="teacher-home-row" key={r.child_id+r.assignment_id} onClick={()=>onNavigate('assignments')}><span><strong>{r.child.name} <span className={r.finished?'homework-status complete':'homework-status'}>{r.finished?'✓ Finished 已完成':'Practising 练习中'}</span></strong><small>{groups.find(g=>g.id===r.child.group_id)?.name} · {r.task.title}</small><small>{date(Number(r.last_seen))}</small></span><span aria-hidden="true">→</span></button>):<p>No homework activity yet this week. 最近七天暂无作业记录。</p>}</section></div></section>;
}

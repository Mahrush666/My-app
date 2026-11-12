import {useEffect,useRef,useState} from 'react';
import {UiText} from './teacher-language';
import TeacherAchievementPyramid from './teacher-achievement-pyramid';
import {rewardTier,allRewardBadges,type RewardState} from '../lib/rewards';
import {addDays,chinaDay} from '../lib/teacher-dashboard';
import type {Campus} from '../lib/staff';
import type {LessonRates,LessonReward,RewardProgram} from '../lib/reward-program';
import './reward-campus.css';

type Request=<T>(path:string,body?:unknown)=>Promise<T>;
type Group={id:string;name:string;campus_id?:string};
type Student={id:string;name:string;group_id:string;xp:number;weeklyXP:number;diamond:boolean;badges:number};
type CampusRewards={campus:Campus;program:RewardProgram;today:string;students:Student[]};
type Preview={name:string;rates:Record<string,LessonRates>};
type Report={name:string;rewards:RewardState;semesters:RewardProgram['semesters'];attendance:{day:string;time:string;class_name:string;status:string;reward:LessonReward|null}[];ht?:{day:string;status:string;lessons:string}[]};

export default function RewardCampus({campuses,groups,activeCampus,owner,request}:{campuses:Campus[];groups:Group[];activeCampus:string;owner:boolean;request:Request}){
 const projection=new URLSearchParams(location.search).get('reward-campus');
 const [campus,setCampus]=useState(campuses.find(site=>site.id===(projection||activeCampus))?.id??campuses[0]?.id??'');
 const [data,setData]=useState<CampusRewards|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0);
 const [mode,setMode]=useState<'overview'|'reports'|'settings'>('overview'),[presenting,setPresenting]=useState(Boolean(projection));
 const [promotion,setPromotion]=useState('');
 const [gains,setGains]=useState<Record<string,number>>({});
 const prior=useRef<CampusRewards|null>(null);
 const api=useRef(request);api.current=request;
 const path='/campus-rewards?campus='+encodeURIComponent(campus);
 useEffect(()=>{
  if(!campus&&campuses.length)setCampus(campuses.find(site=>site.id===(projection||activeCampus))?.id??campuses[0].id);
 },[campus,campuses,activeCampus,projection]);
 useEffect(()=>{
  if(!projection&&campuses.some(site=>site.id===activeCampus))setCampus(activeCampus);
 },[activeCampus]);
 useEffect(()=>{
  if(!campus)return;
  let active=true;
  async function load(){
   setError('');
   try{
    const next=await api.current<CampusRewards>(path);
    if(!active)return;
    const old=prior.current;
    if(old?.campus.id===next.campus.id){
     const changes=next.students.flatMap(student=>{
      const previous=old.students.find(p=>p.id===student.id);
      const tier=rewardTier(student.xp,student.diamond);
      return previous&&tier.min>rewardTier(previous.xp,previous.diamond).min?[student.name+' · '+tier.icon+' '+tier.name]:[];
     });
     if(changes.length)setPromotion(changes.join(' · '));
     const points=Object.fromEntries(next.students.flatMap(student=>{
      const previous=old.students.find(p=>p.id===student.id);
      return previous&&student.xp>previous.xp?[[student.id,student.xp-previous.xp]]:[];
     }));
     if(Object.keys(points).length)setGains(points);
    }
    prior.current=next;
    setData(next);
   }catch(reason){if(active){setData(null);setError((reason as Error).message);}}
  }
  void load();
  const timer=presenting?window.setInterval(load,5000):undefined;
  return()=>{active=false;if(timer)clearInterval(timer);};
 },[path,revision,presenting]);
 useEffect(()=>{
  if(!Object.keys(gains).length)return;
  const timer=setTimeout(()=>setGains({}),2300);
  return()=>clearTimeout(timer);
 },[gains]);
 useEffect(()=>{
  if(!presenting)return;
  const exit=(event:KeyboardEvent)=>{if(event.key==='Escape')setPresenting(false);};
  window.addEventListener('keydown',exit);
  return()=>window.removeEventListener('keydown',exit);
 },[presenting]);

 const current=data?.campus.id===campus?data:null;
 const students=current?.students??[];
 const selectedGroups=groups.filter(group=>(group.campus_id||'main')===campus);
 async function save(body:unknown){
  setBusy(true);
  setError('');
  try{await request(path,body);setRevision(n=>n+1);}
  catch(reason){setError((reason as Error).message);throw reason;}
  finally{setBusy(false);}
 }
 return <section className={presenting?'reward-campus reward-presentation':'reward-campus'}>
  <div className="section-heading"><h2><UiText text={presenting?'Achievement pyramid 成长金字塔':'Campus rewards 校区奖励'}/></h2>
   {presenting?<button onClick={()=>setPresenting(false)}><UiText text="Exit presentation 退出展示"/></button>:
    <div className="reward-campus-nav">
     <button disabled={!current} onClick={()=>{setPromotion('');setPresenting(true);}}><UiText text="Present pyramid 展示金字塔"/></button>
     {current&&<a href={location.pathname+'?reward-campus='+encodeURIComponent(campus)+'#view=teacher'} target="_blank" rel="noopener">
      <UiText text="Open in a new tab 在新标签页展示"/></a>}
    </div>}
  </div>
  {owner&&<label><UiText text="Campus 校区"/><select value={campus} disabled={busy} onChange={event=>{setCampus(event.target.value);setPromotion('');}}>
   {campuses.map(site=><option key={site.id} value={site.id}>{site.name}</option>)}
  </select></label>}
  {!owner&&current&&<p>{current.campus.name}</p>}
  {!presenting&&<div className="reward-campus-nav">
   {([['overview','Pyramid 金字塔'],['reports','Progress reports 成长报告'],...(owner?[['settings','Semester & XP rules 学期和积分规则']] as const:[])] as const)
    .map(([id,label])=><button key={id} aria-pressed={mode===id} onClick={()=>setMode(id)}><UiText text={label}/></button>)}
   <button onClick={()=>setRevision(n=>n+1)}><UiText text="Refresh 刷新"/></button>
  </div>}
  {error&&<p className="notice" role="alert">{error}</p>}
  {!current&&!error&&<p role="status"><UiText text="Loading campus rewards… 正在加载校区奖励…"/></p>}
  {current&&(presenting||mode==='overview')&&<>
   {!presenting&&<p>{students.length} <UiText text="students 学生"/> · {new Set(students.map(s=>s.group_id)).size} <UiText text="classes 班级"/> · {students.reduce((sum,s)=>sum+s.badges,0)} <UiText text="badges earned 已获得徽章"/></p>}
   {promotion&&<div className="reward-promotion-banner" role="status">🎉 {promotion} <button onClick={()=>setPromotion('')}><UiText text="Close 关闭"/></button></div>}
   <TeacherAchievementPyramid students={students} gains={presenting?gains:undefined}/>
  </>}
  {current&&!presenting&&mode==='reports'&&<RewardReports key={campus} campus={campus} students={students} request={request} today={current.today}/>}
  {current&&!presenting&&mode==='settings'&&owner&&<RewardSettings key={campus} current={current} groups={selectedGroups} busy={busy}
   preview={body=>request(path,body)} save={save} request={request} onRestored={()=>setRevision(n=>n+1)}/>}
 </section>;
}

function RewardSettings({current,groups,busy,preview,save,request,onRestored}:{current:CampusRewards;groups:Group[];busy:boolean;
 preview:(body:unknown)=>Promise<{preview:Preview[]}>;save:(body:unknown)=>Promise<void>;request:Request;onRestored:()=>void}){
 const tomorrow=addDays(current.today,1);
 const [name,setName]=useState(''),[start,setStart]=useState(tomorrow);
 const [effective,setEffective]=useState(tomorrow),[target,setTarget]=useState(100),[weeks,setWeeks]=useState(12);
 const [rates,setRates]=useState<Preview[]>([]),[error,setError]=useState('');
 const [group,setGroup]=useState(groups[0]?.id||'');
 const track=current.program.tracks[group]??'general';
 async function showRates(){
  setError('');
  try{const result=await preview({action:'preview',effective,target});setRates(result.preview);}
  catch(reason){setError((reason as Error).message);}
 }
 return <div className="reward-settings">
  <section className="panel"><h3><UiText text="Semesters 学期"/></h3>
   {current.program.semesters.length>0&&<ul>{current.program.semesters.map(s=><li key={s.start}>{s.name} · {s.start}</li>)}</ul>}
   <form onSubmit={event=>{event.preventDefault();void save({action:'semester',name,start}).then(()=>setName('')).catch(()=>{});}}>
    <label><UiText text="Semester name 学期名称"/><input required maxLength={80} value={name} onChange={event=>setName(event.target.value)}/></label>
    <label><UiText text="Start date 开始日期"/><input required type="date" min={current.today} value={start} onChange={event=>setStart(event.target.value)}/></label>
    <button className="primary" disabled={busy}><UiText text="Schedule semester 设置学期"/></button>
   </form>
  </section>
  <section className="panel"><h3><UiText text="Weekly XP rules 每周积分规则"/></h3>
   <p><UiText text="The target is shared across recurring lessons for attendance and offline homework. Online homework and bonuses earn separate XP. 目标积分分配给固定课次的出勤和线下作业。线上作业和奖励另计。"/></p>
   {current.program.rules.length>0&&<ul>{current.program.rules.map(rule=><li key={rule.effective}>{rule.effective} · {rule.target} XP / week</li>)}</ul>}
   <form onSubmit={event=>{event.preventDefault();void showRates();}}>
    <label><UiText text="Weekly XP target 每周积分目标"/><input required type="number" min={1} max={1000} value={target} onChange={event=>{setTarget(Number(event.target.value));setRates([]);}}/></label>
    <label><UiText text="Effective date 生效日期"/><input required type="date" min={tomorrow} value={effective} onChange={event=>{setEffective(event.target.value);setRates([]);}}/></label>
    <label><UiText text="Weeks for estimate 预计周数"/><input required type="number" min={1} max={52} value={weeks} onChange={event=>setWeeks(Number(event.target.value))}/></label>
    <button disabled={busy}><UiText text="Preview rates 预览积分"/></button>
   </form>
   {error&&<p role="alert">{error}</p>}
   {!!rates.length&&<><ul>{rates.map((row,i)=><li key={row.name+i}>{row.name} · {Object.values(row.rates).map(rate=>rate.attendance+rate.homework).join(' + ')} XP</li>)}</ul>
    <p>{target*weeks} XP in {weeks} weeks · {Math.ceil(1100/target)} weeks to 1,100 XP with full attendance and offline homework.</p>
    <button className="primary" disabled={busy} onClick={()=>void save({action:'rules',effective,target}).then(()=>setRates([])).catch(()=>{})}><UiText text="Apply rules 保存规则"/></button>
   </>}
  </section>
  <section className="panel"><h3><UiText text="Class badge goals 班级徽章目标"/></h3>
   <label><UiText text="Class 班级"/><select value={group} onChange={event=>setGroup(event.target.value)}>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
   <label><UiText text="Badge track 徽章类型"/><select disabled={!group||busy} value={track} onChange={event=>void save({action:'track',groupId:group,track:event.target.value}).catch(()=>{})}>
    <option value="general">General</option><option value="kinders">Kinders</option><option value="achievers">Achievers</option><option value="advancers">Advancers</option>
   </select></label>
  </section>
  <RewardsBackup current={current} request={request} onRestored={onRestored}/>
 </div>;
}

function RewardReports({campus,students,request,today}:{campus:string;students:Student[];request:Request;today:string}){
 const [child,setChild]=useState(students[0]?.id??''),[from,setFrom]=useState(''),[to,setTo]=useState(today),[report,setReport]=useState<Report|null>(null),[error,setError]=useState('');
 const [activity,setActivity]=useState<{name:string;label:string;xp:number;created_at:number;revoked:number}[]|null>(null);
 const [loading,setLoading]=useState(false);
 useEffect(()=>{
  let live=true;
  setReport(null);setError('');
  if(child)request<Report>('/reward-report?child='+encodeURIComponent(child)).then(data=>{if(live)setReport(data);}).catch(reason=>{if(live)setError(reason.message);});
  return()=>{live=false;};
 },[child]);
 const inRange=(day:string)=>(!from||day>=from)&&(!to||day<=to);
 const history=report?.rewards.history.filter(row=>inRange(chinaDay(Number(row.created_at))))??[];
 const attended=report?.attendance.filter(row=>inRange(row.day))??[];
 const homework=history.filter(row=>!row.revoked&&row.kind==='homework').length;
 const earnedByEnd=report?.rewards.history.filter(row=>!row.revoked&&(!to||chinaDay(Number(row.created_at))<=to))??[];
 const awarded=earnedByEnd.filter(row=>row.kind==='badge').map(row=>row.source.slice(6));
 const diamond=history.some(row=>!row.revoked&&row.kind==='diamond');
 async function loadActivity(){
  setLoading(true);setError('');
  try{
   const query=new URLSearchParams({campus,activity:'1',from,to});
   const result=await request<{activity:NonNullable<typeof activity>}>('/campus-rewards?'+query);
   setActivity(result.activity);
  }catch(reason){setError((reason as Error).message);}finally{setLoading(false);}
 }
 return <section className="panel reward-reports">
  <div className="reward-report-controls">
   <label><UiText text="Student 学生"/><select value={child} onChange={event=>setChild(event.target.value)}>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
   <label><UiText text="From 开始"/><input type="date" value={from} onChange={event=>setFrom(event.target.value)}/></label>
   <label><UiText text="To 结束"/><input type="date" value={to} onChange={event=>setTo(event.target.value)}/></label>
   {report&&<label><UiText text="Semester 学期"/><select defaultValue="" key={child} onChange={event=>{
    const index=Number(event.target.value),semester=report.semesters[index],next=report.semesters[index+1];
    if(event.target.value===''||!semester){setFrom('');setTo(today);return;}
    setFrom(semester.start);setTo(next?addDays(next.start,-1):today);
   }}><option value="">All dates</option>{report.semesters.map((s,i)=><option key={s.start} value={i}>{s.name}</option>)}</select></label>}
   <button disabled={!report||Boolean(from&&to&&from>to)} onClick={()=>{document.body.classList.add('print-wordquest-rewards');try{window.print();}finally{document.body.classList.remove('print-wordquest-rewards');}}}><UiText text="Print / Save PDF 打印 / 保存 PDF"/></button>
  </div>
  {error&&<p role="alert">{error}</p>}
  {from&&to&&from>to&&<p role="alert"><UiText text="Choose an end date on or after the start date. 结束日期不能早于开始日期。"/></p>}
  {report&&<article className="reward-print-report">
   <h3>{report.name} · <UiText text="Progress report 成长报告"/></h3>
   <p>{from||'Beginning'} – {to||'Latest'} · {history.filter(h=>!h.revoked).reduce((sum,h)=>sum+Number(h.xp),0)} XP</p>
   <p>{attended.filter(r=>r.status==='present'||r.status==='late').length}/{attended.length} <UiText text="scheduled lessons attended 已参加的课次"/>
    {' · '}{homework} <UiText text="online homework completions 完成线上作业"/></p>
   <p><UiText text="Badges earned 已获得徽章"/> · {awarded.map(id=>allRewardBadges.find(b=>b.id===id)?.name||id).join(', ')||'—'}</p>
   <p><UiText text="Diamond approval 钻石认证"/> · {diamond?'✓':'—'}</p>
   {attended.length>0&&<table><thead><tr><th>Date</th><th>Class</th><th>Attendance</th><th>Offline homework</th><th>Participation</th><th>Extra XP</th><th>Note</th></tr></thead>
    <tbody>{attended.map((row,i)=><tr key={i}><td>{row.day} {row.time}</td><td>{row.class_name}</td><td>{row.status}</td><td>{row.reward?.homework??'—'}</td><td>{row.reward?.participation??'—'}</td><td>{row.reward?.extra??'—'}</td><td>{row.reward?.note||'—'}</td></tr>)}</tbody>
   </table>}
   {!!report.ht?.some(row=>inRange(row.day))&&<><h4><UiText text="HT daily attendance HT 每日出勤"/></h4>
    <ul>{report.ht.filter(row=>inRange(row.day)).map((row,i)=><li key={i}>{row.day} · {row.status} · {row.lessons||'—'}</li>)}</ul></>}
   <h4><UiText text="XP activity 积分记录"/></h4>
   <ul>{history.map(row=><li key={row.id}>{chinaDay(Number(row.created_at))} · {row.label} · {row.revoked?'Undone':row.xp+' XP'}</li>)}</ul>
  </article>}
  <details className="reward-activity" onToggle={event=>{if(event.currentTarget.open&&!activity&&!loading)void loadActivity();}}>
   <summary><UiText text="Campus activity log 校区积分记录"/></summary>
   {loading&&<p role="status">Loading…</p>}<button disabled={loading||Boolean(from&&to&&from>to)} onClick={()=>void loadActivity()}><UiText text="Refresh activity for these dates 刷新此日期范围的记录"/></button>
   {activity&&<ul>{activity.filter(row=>inRange(chinaDay(Number(row.created_at)))).slice(0,150).map((row,i)=><li key={i}>{chinaDay(Number(row.created_at))} · {row.name} · {row.label} · {row.revoked?'Undone':row.xp+' XP'}</li>)}</ul>}
  </details>
 </section>;
}

function RewardsBackup({current,request,onRestored}:{current:CampusRewards;request:Request;onRestored:()=>void}){
 const [backup,setBackup]=useState<unknown>(null);
 const [preview,setPreview]=useState<{awards:number;settings:number;skipped:number;program:boolean}|null>(null);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const path='/rewards-backup?campus='+encodeURIComponent(current.campus.id);
 async function act(fn:()=>Promise<void>){
  setBusy(true);setError('');setMessage('');
  try{await fn();}catch(reason){setError((reason as Error).message);}finally{setBusy(false);}
 }
 async function download(){
  const data=await request(path);
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const link=document.createElement('a');
  link.href=url;link.download='wordquest-rewards-'+current.today+'.json';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
 }
 return <section className="panel">
  <h3><UiText text="Rewards backup 奖励备份"/></h3>
  <p><UiText text="Back up campus rewards settings, teacher awards, lesson points, and challenges. Restore adds missing records to the same campus. 备份校区奖励设置、老师奖励、课堂积分及挑战。恢复时只补充同一校区缺失的记录。"/></p>
  <button disabled={busy} onClick={()=>void act(download)}><UiText text="Download backup 下载备份"/></button>
  <label><UiText text="Preview a backup 预览备份"/><input disabled={busy} type="file" accept="application/json,.json" onChange={event=>{
   const file=event.target.files?.[0];setBackup(null);setPreview(null);
   if(!file)return;
   void act(async()=>{
    if(file.size>1900000)throw Error('Choose a backup under 1.9 MB.');
    const data:unknown=JSON.parse(await file.text());
    setPreview(await request(path,{action:'preview',backup:data}));
    setBackup(data);
   });
  }}/></label>
  {preview&&<><p>{preview.awards} awards · {preview.settings} lesson or challenge records · {preview.skipped} unavailable records · {preview.program?'Campus settings can be restored':'Campus settings already exist'}</p>
   <button className="primary" disabled={busy} onClick={()=>void act(async()=>{
    const result=await request<{applied:number}>(path,{action:'restore',backup});
    onRestored();setMessage(result.applied+' records restored.');setPreview(null);setBackup(null);
   })}><UiText text="Restore missing records 恢复缺失记录"/></button></>}
  {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
 </section>;
}

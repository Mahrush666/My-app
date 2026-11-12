import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ChevronDown,ChevronRight,ClipboardList,Star,Users,CalendarDays,Check,Minus} from 'lucide-react';
import {UiText} from './teacher-language';
import TeacherClassPractice from './teacher-class-practice';
import HomeworkManager from './homework-manager';
import HomeworkReports from './homework-reports';
import {TeacherRewards} from './rewards';
import type {RewardState} from '../lib/rewards';
import './teacher-class-directory.css';

type Group={id:string;name:string;campus_id?:string};
type Student={id:string;name:string;group_id:string;approved:number};
type HistoryProps=Pick<Parameters<typeof HomeworkManager>[0],'assignments'|'reports'>;
type Request=<T>(path:string,data?:unknown)=>Promise<T>;

function ClassSection({label,icon:Icon,children,eager=false,showInvitation=false}:{
 label:string;icon:typeof Users;children:ReactNode;eager?:boolean;showInvitation?:boolean;
}){
 const details=useRef<HTMLDetailsElement>(null);
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(showInvitation&&details.current)details.current.open=true},[showInvitation]);
 return <details className="class-directory-row" ref={details} onToggle={e=>{if(e.target===e.currentTarget)setOpen(e.currentTarget.open)}}>
  <summary><Icon size={18} aria-hidden="true"/><span><UiText text={label}/></span><ChevronDown size={17} aria-hidden="true"/></summary>
  {(open||eager)&&<div className="class-directory-body">{children}</div>}
 </details>;
}

function DailyStatus({enabled}:{enabled:boolean}){
 const Icon=enabled?Check:Minus;
 return <span className="class-directory-daily-status" data-enabled={enabled}>
  <Icon size={14} aria-hidden="true"/>
  <UiText text={enabled?'Daily practice on 每日练习已开启':'Daily practice off 每日练习已关闭'}/>
 </span>;
}

function DailyPracticeSetting({enabled,canEdit,onChange}:{
 enabled:boolean;canEdit:boolean;onChange:(enabled:boolean)=>Promise<void>;
}){
 const [saving,setSaving]=useState(false);
 const [failed,setFailed]=useState(false);
 async function save(next:boolean){
  if(saving)return;
  setSaving(true);
  setFailed(false);
  try{await onChange(next);}
  catch{setFailed(true);}
  finally{setSaving(false);}
 }
 return <div className="class-directory-daily-setting">
  {canEdit?<label>
   <input type="checkbox" role="switch" checked={enabled} disabled={saving} onChange={e=>void save(e.target.checked)}/>
   <UiText text="Daily practice 每日练习"/>
  </label>:<DailyStatus enabled={enabled}/>}
  <span role="status">
   {saving?<UiText text="Saving… 正在保存…"/>:canEdit?<UiText text={enabled?'On 已开启':'Off 已关闭'}/>:null}
  </span>
  {failed&&<span role="alert"><UiText text="Could not save. Try again. 保存失败，请重试。"/></span>}
 </div>;
}

export default function TeacherClassDirectory({groups,children,assignments,reports,campuses,showCampus,selectedId,
 onSelect,newClass,roster,hasInvitation,canReward,request,onRefresh,dailyGroups,canSetDailyPractice,onDailyPracticeChange}:HistoryProps&{
 groups:Group[];children:Student[];campuses?:{id:string;name:string}[];showCampus:boolean;
 selectedId:string;onSelect:(id:string)=>void;newClass:ReactNode;roster:ReactNode;
 hasInvitation:boolean;canReward:boolean;request:Request;onRefresh:()=>Promise<void>;
 dailyGroups:string[];canSetDailyPractice:boolean;onDailyPracticeChange:(id:string,enabled:boolean)=>Promise<void>;
}){
 const [rewardRevision,setRewardRevision]=useState(0);
 const selected=groups.find(g=>g.id===selectedId);
 const heading=useRef<HTMLHeadingElement>(null);
 const previous=useRef(selected?.id);
 useEffect(()=>{
  if(previous.current!==selected?.id)heading.current?.focus();
  previous.current=selected?.id;
 },[selected?.id]);

 if(!selected)return <section className="class-directory">
  <header className="class-directory-heading"><h2 ref={heading} tabIndex={-1}><UiText text="Your classes 班级"/></h2>{newClass}</header>
  {!groups.length&&<p className="small-note"><UiText text="No classes here yet. 暂无班级。"/></p>}
  <div className="class-directory-grid">{[...groups].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})).map(group=>{
   const campus=showCampus?campuses?.find(c=>c.id===(group.campus_id||'main'))?.name:undefined;
   const count=children.filter(child=>child.group_id===group.id).length;
   return <button type="button" className="class-directory-tile" key={group.id} onClick={()=>onSelect(group.id)}>
    <span className="class-directory-icon"><Users size={18} aria-hidden="true"/></span>
    <span><strong>{group.name}</strong><small>{campus&&campus+' · '}{count} <UiText text="students 名学生"/></small><DailyStatus enabled={dailyGroups.includes(group.id)}/></span>
    <ChevronRight size={16} aria-hidden="true"/>
   </button>;
  })}</div>
 </section>;

 const students=children.filter(child=>child.group_id===selected.id);
 const history=assignments.filter(assignment=>assignment.group_id===selected.id);
 const ids=new Set(history.map(assignment=>assignment.id));
 const studentIds=new Set(students.map(student=>student.id));
 const transferredReports=reports.filter(report=>report.attempts>0&&studentIds.has(report.child_id)&&
  report.assignment_group_id&&report.assignment_group_id!==selected.id);
 const transferredAssignments=[...new Map(transferredReports.map(report=>[report.assignment_id,{
  id:report.assignment_id,group_id:report.assignment_group_id!,title:report.title||'',activities:report.activities||'[]',
 }])).values()];
 return <section className="class-directory">
  <button type="button" className="class-directory-back" onClick={()=>onSelect('')}><ArrowLeft size={17} aria-hidden="true"/><UiText text="All classes 所有班级"/></button>
  <header className="class-directory-heading"><h2 ref={heading} tabIndex={-1}>{selected.name}</h2><span className="small-note">{students.length} <UiText text="students 名学生"/></span></header>
  <DailyPracticeSetting key={'daily-practice:'+selected.id} enabled={dailyGroups.includes(selected.id)} canEdit={canSetDailyPractice}
   onChange={enabled=>onDailyPracticeChange(selected.id,enabled)}/>
  <div className="class-directory-sections" key={selected.id}>
   <ClassSection label="Students 学生名单" icon={Users} eager showInvitation={hasInvitation}>{roster}</ClassSection>
   <ClassSection label="This week’s practice 本周练习" icon={CalendarDays}>
    <TeacherClassPractice embedded showXP={false} groupId={selected.id} request={request}/>
   </ClassSection>
   <ClassSection label="Homework history 作业历史" icon={ClipboardList}>
    <HomeworkManager historyOnly groups={[selected]} campuses={campuses} children={students}
     assignments={history} reports={reports.filter(report=>ids.has(report.assignment_id))} dailyGroups={dailyGroups}
     canAssign={false} canDelete={false} request={request} onSaved={onRefresh}/>
    {!!transferredReports.length&&<HomeworkReports heading="Homework from previous classes 转班前的作业"
     children={students} assignments={transferredAssignments} reports={transferredReports} request={request}/>}
   </ClassSection>
   <ClassSection label="XP 经验值" icon={Star}>
    <TeacherClassPractice embedded view="xp" refreshKey={rewardRevision} groupId={selected.id} request={request}/>
    {canReward&&<TeacherRewards students={students} onChanged={()=>setRewardRevision(n=>n+1)} request={(path,data)=>request<RewardState>(path,data)}/>}
   </ClassSection>
  </div>
 </section>;
}

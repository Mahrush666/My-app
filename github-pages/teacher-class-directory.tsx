import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ChevronDown,ChevronRight,ClipboardList,Star,Users,CalendarDays} from 'lucide-react';
import {UiText} from './teacher-language';
import TeacherClassPractice from './teacher-class-practice';
import HomeworkManager from './homework-manager';
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

export default function TeacherClassDirectory({groups,children,assignments,reports,campuses,showCampus,selectedId,
 onSelect,newClass,roster,hasInvitation,canReward,request,onRefresh}:HistoryProps&{
 groups:Group[];children:Student[];campuses?:{id:string;name:string}[];showCampus:boolean;
 selectedId:string;onSelect:(id:string)=>void;newClass:ReactNode;roster:ReactNode;
 hasInvitation:boolean;canReward:boolean;request:Request;onRefresh:()=>Promise<void>;
}){
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
    <span><strong>{group.name}</strong><small>{campus&&campus+' · '}{count} <UiText text="students 名学生"/></small></span>
    <ChevronRight size={16} aria-hidden="true"/>
   </button>;
  })}</div>
 </section>;

 const students=children.filter(child=>child.group_id===selected.id);
 const history=assignments.filter(assignment=>assignment.group_id===selected.id);
 const ids=new Set(history.map(assignment=>assignment.id));
 return <section className="class-directory">
  <button type="button" className="class-directory-back" onClick={()=>onSelect('')}><ArrowLeft size={17} aria-hidden="true"/><UiText text="All classes 所有班级"/></button>
  <header className="class-directory-heading"><h2 ref={heading} tabIndex={-1}>{selected.name}</h2><span className="small-note">{students.length} <UiText text="students 名学生"/></span></header>
  <div className="class-directory-sections" key={selected.id}>
   <ClassSection label="Students 学生名单" icon={Users} eager showInvitation={hasInvitation}>{roster}</ClassSection>
   <ClassSection label="This week’s practice 本周练习" icon={CalendarDays}>
    <TeacherClassPractice embedded showXP={false} groupId={selected.id} request={request}/>
   </ClassSection>
   <ClassSection label="Homework history 作业历史" icon={ClipboardList}>
    <HomeworkManager historyOnly groups={[selected]} campuses={campuses} children={students}
     assignments={history} reports={reports.filter(report=>ids.has(report.assignment_id))} dailyGroups={[]}
     canAssign={false} canDelete={false} request={request} onSaved={onRefresh}/>
   </ClassSection>
   <ClassSection label="XP 经验值" icon={Star}>
    <TeacherClassPractice embedded view="xp" groupId={selected.id} request={request}/>
    {canReward&&<TeacherRewards students={students} request={(path,data)=>request<RewardState>(path,data)}/>}
   </ClassSection>
  </div>
 </section>;
}

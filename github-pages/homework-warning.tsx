import {createContext,useContext} from 'react';
import {TriangleAlert} from 'lucide-react';
import type {homeworkBacklog} from '../lib/homework-backlog';
import {useTeacherText} from './teacher-language';
import './homework-warning.css';

export const HomeworkWarningContext = createContext<ReturnType<typeof homeworkBacklog> | null>(null);

export function HomeworkWarning({id,kind='student'}:{id?:string; kind?:'student'|'group'}) {
 const warnings = useContext(HomeworkWarningContext);
 const {t} = useTeacherText();
 if (!id || !warnings?.[kind === 'group' ? 'groupIds' : 'studentIds'].has(id)) return null;
 const label = t(kind === 'group'
  ? 'Four or more consecutive lessons with homework still unfinished in this class 班级连续四课或以上仍有未完成作业'
  : 'Four or more consecutive lessons with unfinished homework 连续四课或以上作业未完成');
 return <span className="homework-warning" role="img" aria-label={label} title={label}><TriangleAlert size={15} aria-hidden="true"/></span>;
}

export function HomeworkNameOption({id,name,kind='group'}:{id:string;name:string;kind?:'student'|'group'}) {
 const warnings = useContext(HomeworkWarningContext);
 const flagged = warnings?.[kind === 'group' ? 'groupIds' : 'studentIds'].has(id);
 return <option value={id}>{name}{flagged ? ' ⚠' : ''}</option>;
}

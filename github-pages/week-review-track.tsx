import {Check} from 'lucide-react';
import {addDays} from '../lib/teacher-dashboard';
const names=[['Mon','一','Monday'],['Tue','二','Tuesday'],['Wed','三','Wednesday'],['Thu','四','Thursday'],['Fri','五','Friday'],['Sat','六','Saturday'],['Sun','日','Sunday']];
export default function WeekReviewTrack({weekStart,today,days=[],compact=false,label='Your review this week 本周复习'}:{weekStart:string;today:string;days?:string[];compact?:boolean;label?:string}){
 const done=new Set(days);
 return <ol className={'week-review-track'+(compact?' compact':'')} aria-label={label}>{names.map(([en,zh,full],i)=>{const day=addDays(weekStart,i),checked=day<=today&&done.has(day),future=day>today,status=checked?'Practised 已练习':future?'Upcoming 即将到来':'Not practised 尚未练习';return <li key={day} className={(checked?'is-done ':'')+(day===today?'is-today ':'')+(future?'is-future':'')} aria-label={full+' '+day+' · '+status} aria-current={day===today?'date':undefined} title={day+' · '+status}><span className="week-review-day">{en}<span lang="zh-CN">{zh}</span></span><span className="week-review-tick" aria-hidden="true">{checked?<Check strokeWidth={3.5}/>:<span/>}</span><span className="week-review-date" aria-hidden="true">{Number(day.slice(-2))}</span></li>})}</ol>
}

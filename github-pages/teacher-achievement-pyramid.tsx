import type {CSSProperties} from 'react';
import {rewardTier,rewardTiers} from '../lib/rewards';
import type {ClassPractice} from '../lib/class-practice';
import {UiText} from './teacher-language';
import './teacher-achievement-pyramid.css';

const palette=[
 {background:'#eaf6ef',color:'#276c4a'},
 {background:'#f8ede4',color:'#89552d'},
 {background:'#eef1f8',color:'#56647e'},
 {background:'#fff4d4',color:'#86600a'},
 {background:'#e7f4ff',color:'#28618c'},
];
// Mounted only in the authenticated teacher's class XP view.
export default function TeacherAchievementPyramid({students,gains}:{gains?:Record<string,number>;students:Pick<ClassPractice['students'][number],'id'|'name'|'xp'|'diamond'>[]}){
 return <section className="teacher-achievement-pyramid" aria-label="Achievement pyramid">
  <header><h3><UiText text="Our achievement pyramid 成长金字塔"/></h3>
   <p><UiText text="Five levels to explore together. Every learner belongs. 一起探索五个等级，每位学生都有自己的位置。"/></p>
  </header>
  <div className="tap-levels">{[...rewardTiers].reverse().map(tier=>{
   const index=rewardTiers.indexOf(tier),colors=palette[index];
   const members=students.filter(s=>rewardTier(s.xp,s.diamond).name===tier.name).sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
   const style={'--tier-width':(100-index*13)+'%','--tier-mobile-width':(100-index*7)+'%','--tier-background':colors.background,'--tier-color':colors.color} as CSSProperties;
   return <section className="tap-level" data-tier={tier.name} key={tier.name} style={style} aria-label={tier.name}>
    <h4><span aria-hidden="true">{tier.icon}</span> {tier.name==='Explorer'?'Explorers':tier.name} <span className="tap-count">{members.length}</span></h4>
    <p className="tap-range">{tier.min.toLocaleString()}+ XP{tier.name==='Diamond'&&<> · <UiText text="Teacher-approved outstanding work 老师认可的优秀表现"/></>}</p>
    {members.length?<ul>{members.map(student=><li key={student.id}>
     <span className="tap-avatar" aria-hidden="true">{Array.from(student.name.trim())[0]?.toLocaleUpperCase()||'✦'}</span>
     <strong>{student.name}</strong><small>{student.xp.toLocaleString()} XP</small>{(gains?.[student.id]??0)>0&&<span className="pyramid-xp-star">★ +{gains?.[student.id]} XP</span>}
     {tier.name==='Gold'&&student.xp>=1100&&!student.diamond&&<small className="tap-approval"><UiText text="Diamond approval needed 待钻石认证"/></small>}
    </li>)}</ul>:<p className="tap-empty"><UiText text="Ready to explore 等待探索"/></p>}
   </section>;
  })}</div>
  <p className="tap-caption"><UiText text="Equal recognition within each level · Names appear alphabetically. 同等级同样表扬 · 姓名按字母排序。"/></p>
 </section>;
}

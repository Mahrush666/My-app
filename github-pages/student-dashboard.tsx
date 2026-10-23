import {useEffect,useState} from 'react';
import {lessons,type Lesson} from './lessons';
import {bookUnits,lessonLabel} from './lesson-groups';
import {StudentRewards} from './rewards';
import {rewardBadges,type RewardState} from '../lib/rewards';
import type {StudentDashboardData} from '../lib/student-dashboard';
import type {Progress} from '../app/words';
import type {ActivityDraft} from '../lib/classroom-types';
import {enabledActivities,type ActivityId} from '../lib/unit-activities';
import {supportsActivity} from '../lib/activity-availability';
import Practice from '../app/practice';
import './student-dashboard.css';
type Assignment={id:string;title:string;due_date:string};
export default function StudentDashboard({studentId,name,data,rewards,progress,unfinished,completed,onHomework,request,onRefresh}:{studentId:string;name:string;data?:StudentDashboardData;rewards?:RewardState;progress:Progress;unfinished:Assignment[];completed:Assignment[];onHomework:(id:string)=>void;request:(path:string,data?:unknown)=>Promise<{progress:Progress}>;onRefresh:()=>Promise<void>}){
 const [screen,setScreen]=useState<'home'|'homework'|'review'|'books'>('home');
 const [selected,setSelected]=useState<Lesson|null>(null),[saved,setSaved]=useState(progress),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [reviewProgress,setReviewProgress]=useState<Progress>({});
 useEffect(()=>setSaved(progress),[progress]);
 const due=(lesson:Lesson)=>lesson.words.filter(w=>w.id&&saved[w.id]&&saved[w.id].due<=Date.now());
 const dueLessons=lessons.filter(l=>due(l).length);
 const dueCount=new Set(dueLessons.flatMap(l=>due(l).map(w=>w.id))).size;
 async function back(){setSelected(null);setScreen('home');setBusy(true);setError('');try{await onRefresh()}catch{setError('Could not refresh. Please try again. 暂时无法刷新，请重试。')}finally{setBusy(false)}}
 function openLesson(l:Lesson){setReviewProgress(screen==='review'?Object.fromEntries(l.words.map(w=>[w.id!,saved[w.id!]||{step:0,due:Number.MAX_SAFE_INTEGER}])):saved);setSelected(l);setError('')}
 async function save(event:ActivityDraft){if(event.detail.exercise==='sentence-speak'||(typeof event.detail.spellingStage==='number'&&event.detail.spellingStage<5))return;if(typeof event.correct!=='boolean'||!event.wordId||!selected?.words.some(w=>w.id===event.wordId))return;const result=await request('/practice-progress',{unitId:selected.id,wordId:event.wordId,correct:event.correct,correction:event.detail.correction===true});setSaved(result.progress)}
 const maxXP=Math.max(1,...(data?.classmates.map(c=>c.xp)||[]));
 const earned=rewardBadges.filter(b=>rewards?.badges.includes(b.id));
 let activities:ActivityId[]=selected?enabledActivities(selected.defaultActivities||['word-choice']).filter(a=>supportsActivity(a,selected)):[];
 if(screen==='review'&&selected)activities=[selected.defaultAge?.startsWith('3')?'picture-listen':'word-choice'];
 return <div className="student-dashboard">
 <header className="student-dash-heading"><div><h1>{name}’s dashboard 学习主页</h1>{screen==='home'&&<p>Let’s learn something today! 今天一起学习吧！</p>}</div>{screen!=='home'&&<button disabled={busy} onClick={()=>void back()}>← Dashboard 主页</button>}</header>
 {error&&<p role="alert" className="notice">{error}</p>}
 {screen==='home'&&<>
 <div className="student-dash-stats"><section><span>Next class 下次上课</span><strong>{data?.nextClass?data.nextClass.day+' · '+data.nextClass.time:'Not scheduled 暂未安排'}</strong>{data?.nextClass&&<small>China time 中国时间 · {data.nextClass.duration} min</small>}</section><section><span>This week 本周</span><strong>{data?.weeklyXP||0} XP ⭐</strong><small>Monday–Sunday 周一至周日</small></section></div>
 <nav className="student-dash-actions" aria-label="Student activities">
 <button className="primary" onClick={()=>setScreen('homework')}><span>📋 Homework 作业</span><small>{unfinished.length?unfinished.length+' to finish 待完成':'All homework finished! 已全部完成！'}</small></button>
 <button onClick={()=>setScreen('review')}><span>🔁 Time to review 复习</span><small>{dueCount?dueCount+' words ready 待复习词汇':'No words due 暂无待复习词汇'}</small></button>
 <button onClick={()=>setScreen('books')}><span>📚 Books 课本</span><small>Extra practice 自主练习</small></button>
 </nav>

 <section className="panel"><h2>My rewards 我的奖励</h2><div className="student-earned-badges">{earned.length?earned.map(b=><span key={b.id}>{b.icon} {b.name}</span>):<p>Your first badge is waiting! 期待你的第一枚徽章！</p>}</div><StudentRewards value={rewards}/></section>
 <details className="panel" open><summary>Our class this week 班级本周进步</summary><p className="small-note">Week of 本周开始 {data?.weekStart} · XP</p>{data?.classmates.map((c,i)=><div className="student-weekly" key={i}><div><span>{c.name}{c.me?' · You 你':''}</span><strong>{c.xp} XP</strong></div><progress max={maxXP} value={c.xp} aria-label={c.name+' weekly XP'}/></div>)}{!data?.classmates.length&&<p>No class progress yet. 暂无班级进度。</p>}</details>
 </>}
 {screen==='homework'&&<section className="panel"><h2>Homework 作业</h2>{!unfinished.length&&<p className="homework-finished">⭐ All homework is finished! 所有作业已完成！</p>}{unfinished.map(a=><article className="homework-card" key={a.id}><h3>{a.title}</h3>{a.due_date&&<p>Due 截止 {a.due_date}</p>}<button className="primary" onClick={()=>onHomework(a.id)}>Start / continue 开始练习</button></article>)}{!!completed.length&&<details><summary>Finished 已完成 ({completed.length})</summary>{completed.map(a=><div className="student-dash-task" key={a.id}><span>✓ {a.title}</span><button onClick={()=>onHomework(a.id)}>Open 打开</button></div>)}</details>}</section>}
 {screen==='review'&&!selected&&<section className="panel"><h2>Time to review 复习时间</h2>{!dueLessons.length?<p>All caught up! Come back when your words are ready. 复习完成，单词到期后再来吧！</p>:dueLessons.map(l=><button className="student-lesson-link" key={l.id} onClick={()=>openLesson(l)}>{l.book} · {l.title}<small>{due(l).length} words 单词</small></button>)}</section>}
 {screen==='books'&&!selected&&<section className="panel"><h2>Choose a book 选择课本</h2>{[...new Set(lessons.map(l=>l.book))].map(book=><details className="student-book" key={book}><summary>📚 {book}</summary>{bookUnits(lessons,book).map(unit=><details key={unit.id}><summary>Unit {unit.number} · {unit.title}</summary>{lessons.filter(l=>l.book===book&&l.unit?.id===unit.id).map(l=><button className="student-lesson-link" key={l.id} onClick={()=>openLesson(l)}>{lessonLabel(l)}</button>)}</details>)}{lessons.filter(l=>l.book===book&&!l.unit).map(l=><button className="student-lesson-link" key={l.id} onClick={()=>openLesson(l)}>{lessonLabel(l)}</button>)}</details>)}</section>}
 {selected&&<section className="panel"><div className="section-heading"><h2>{selected.title}</h2><button onClick={()=>setSelected(null)}>← {screen==='review'?'Review 复习':'Books 课本'}</button></div><Practice spellingScope={studentId+':practice'} sentencePractice={selected.sentencePractice} age={selected.defaultAge} key={selected.id+screen} homework={screen==='books'} vocabulary={selected.words} readings={selected.readings} story={selected.story} readingStory={selected.readingStory} videos={selected.videos} activities={activities} unitId={selected.id} initialProgress={reviewProgress} onActivity={save}/></section>}
 </div>
}

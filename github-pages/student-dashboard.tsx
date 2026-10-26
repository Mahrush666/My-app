import DailyAdventure from './daily-adventure';
import HomeworkMeter from './homework-meter';
import ReactorLeaderboard,{type ReactorLeaderboardData} from './reactor-leaderboard';
import {DoneSticker} from '../app/finish-celebration';
import {publicAsset} from '../lib/public-runtime';
import {BookOpen,CalendarDays,ChevronRight,Home,RotateCcw,Sparkles,Trophy,Users} from 'lucide-react';
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
export default function StudentDashboard({homeworkProgress,lessonSettings,studentId,name,data,rewards,progress,unfinished,completed,onHomework,request,onRefresh}:{homeworkProgress?:Record<string,import('../lib/student-homework-progress').HomeworkProgress>;lessonSettings?:import('../lib/unit-activities').Settings;studentId:string;name:string;data?:StudentDashboardData;rewards?:RewardState;progress:Progress;unfinished:Assignment[];completed:Assignment[];onHomework:(id:string)=>void;request:(path:string,data?:unknown)=>Promise<{progress:Progress}>;onRefresh:()=>Promise<void>}){
 const [screen,setScreen]=useState<'daily'|'home'|'homework'|'review'|'books'|'rewards'|'class'|'leaderboard'>('home');
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
 let activities:ActivityId[]=selected?enabledActivities(lessonSettings?.[selected.id]?.activities||selected.defaultActivities||['word-choice']).filter(a=>supportsActivity(a,selected)):[];
 if(screen==='review'&&selected)activities=[selected.defaultAge?.startsWith('3')?'picture-listen':'word-choice'];
 return <div className="student-dashboard">
 <div className="student-brand"><span>✦ Word<span>Quest</span></span><span className="student-avatar" aria-label={name}>{name.slice(0,1).toUpperCase()}</span></div>
 <header className={screen==='home'?'student-dash-heading student-welcome':'student-dash-heading'}>{screen==='home'&&<img className="student-welcome-archer" src={publicAsset('mascots/archer-welcome.webp')} width={128} height={128} alt="" aria-hidden="true" decoding="async"/>}<div className="student-welcome-copy"><h1>{screen==='home'?`Hi, ${name}!`:screen==='rewards'?'My rewards 我的奖励':screen==='class'?'My class 我的班级':'Let’s practise 一起练习'}</h1>{screen==='home'&&<p>Ready for a little adventure? 今天一起学习吧！</p>}</div>{screen!=='home'&&<button disabled={busy} onClick={()=>void back()}>← Dashboard 主页</button>}</header>
 {error&&<p role="alert" className="notice">{error}</p>}
 {screen==='home'&&<>
 {data?.dailyEnabled&&<section className="student-homework-hero"><div className="student-hero-label"><Sparkles size={26}/>Daily practice 每日练习</div><h2>Today’s adventure 今日冒险</h2><p>12 challenges · Around 8–10 minutes</p><button className="primary" onClick={()=>setScreen('daily')}>Play 开始冒险 <ChevronRight size={20}/></button></section>}
 <section className={data?.dailyEnabled?"panel":"student-homework-hero"}><div className="student-hero-label"><BookOpen size={26}/><span>{data?.dailyEnabled?'Extra practice 课后练习':'Your homework 作业'}</span></div>{unfinished.length?<><h2>{unfinished[0].title}</h2><HomeworkMeter value={homeworkProgress?.[unfinished[0].id]}/>{unfinished[0].due_date&&<p>Due 截止 {unfinished[0].due_date}</p>}<button className="primary" onClick={()=>onHomework(unfinished[0].id)}>Continue 继续 <ChevronRight size={20}/></button>{unfinished.length>1&&<button className="student-all-homework" onClick={()=>setScreen('homework')}>All homework 全部作业 ({unfinished.length}) →</button>}</>:<><h2>All homework finished! 已全部完成！</h2><p>Great work. Try a little review! 做得好，来复习一下吧！</p></>}</section>
 <nav className="student-dash-actions" aria-label="Student activities">
 <button onClick={()=>setScreen('review')}><RotateCcw size={30}/><span>Review 复习<small>{dueCount?dueCount+' words ready 待复习':'All caught up 暂无待复习'}</small></span></button>
 <button onClick={()=>setScreen('leaderboard')}><Trophy size={30}/><span>Word Reactor<small>Leaderboard 排行榜</small></span></button>
 <button onClick={()=>setScreen('books')}><BookOpen size={30}/><span>Books 课本<small>Extra practice 自主练习</small></span></button>
 </nav>
 <section className="student-next-class"><CalendarDays size={28}/><div><span>Next class 下次上课</span><strong>{data?.nextClass?data.nextClass.day+' · '+data.nextClass.time:'Not scheduled 暂未安排'}</strong>{data?.nextClass&&<small>China time 中国时间 · {data.nextClass.duration} min</small>}</div></section>
 <section className="student-week-card"><div><h2>This week 本周</h2><strong><Sparkles size={20}/> {data?.weeklyXP||0} XP</strong></div><div className="student-earned-badges">{earned.length?earned.slice(0,3).map(b=><span key={b.id}>{b.icon}<small>{b.name}</small></span>):<p>Your first badge is waiting! 期待你的第一枚徽章！</p>}</div><button className="text-link" onClick={()=>setScreen('rewards')}>My rewards 我的奖励 →</button></section>
 </>}
 {screen==='daily'&&<DailyAdventure request={(path,body)=>request(path,body)} onExit={()=>void back()}/>}
 {screen==='leaderboard'&&<ReactorLeaderboard request={()=>request('/reactor-leaderboard',{}) as unknown as Promise<ReactorLeaderboardData>}/>}
 {screen==='rewards'&&<section className="panel"><StudentRewards value={rewards}/><div className="student-earned-badges">{earned.map(b=><span key={b.id}>{b.icon}<small>{b.name}</small></span>)}</div></section>}
 {screen==='class'&&<section className="panel"><h2>Our class this week 班级本周进步</h2>{data?.weekStart&&<p className="small-note">Week of 本周开始 {data.weekStart} · XP</p>}{data?.classmates.map((c,i)=><div className="student-weekly" key={i}><div><span>{c.name}{c.me?' · You 你':''}</span><strong>{c.xp} XP</strong></div><progress max={maxXP} value={c.xp} aria-label={c.name+' weekly XP'}/></div>)}{!data?.classmates.length&&<p>No class progress yet. 暂无班级进度。</p>}</section>}
 {screen==='homework'&&<section className="panel"><h2>Homework 作业</h2>{!unfinished.length&&<p className="homework-finished">⭐ All homework is finished! 所有作业已完成！</p>}{unfinished.map(a=><article className="homework-card" key={a.id}><h3>{a.title}</h3><HomeworkMeter value={homeworkProgress?.[a.id]}/>{a.due_date&&<p>Due 截止 {a.due_date}</p>}<button className="primary" onClick={()=>onHomework(a.id)}>Start / continue 开始练习</button></article>)}{!!completed.length&&<details><summary>Finished 已完成 ({completed.length})</summary>{completed.map(a=><div className="student-dash-task" key={a.id}><span><DoneSticker/> {a.title}</span><button onClick={()=>onHomework(a.id)}>Open 打开</button></div>)}</details>}</section>}
 {screen==='review'&&!selected&&<section className="panel"><h2>Time to review 复习时间</h2>{!dueLessons.length?<p>All caught up! Come back when your words are ready. 复习完成，单词到期后再来吧！</p>:dueLessons.map(l=><button className="student-lesson-link" key={l.id} onClick={()=>openLesson(l)}>{l.book} · {l.title}<small>{due(l).length} words 单词</small></button>)}</section>}
 {screen==='books'&&!selected&&<section className="panel"><h2>Choose a book 选择课本</h2>{[...new Set(lessons.map(l=>l.book))].map(book=><details className="student-book" key={book}><summary>📚 {book}</summary>{bookUnits(lessons,book).map(unit=><details key={unit.id}><summary>Unit {unit.number} · {unit.title}</summary>{lessons.filter(l=>l.book===book&&l.unit?.id===unit.id).map(l=><button className="student-lesson-link" key={l.id} onClick={()=>openLesson(l)}>{lessonLabel(l)}</button>)}</details>)}{lessons.filter(l=>l.book===book&&!l.unit).map(l=><button className="student-lesson-link" key={l.id} onClick={()=>openLesson(l)}>{lessonLabel(l)}</button>)}</details>)}</section>}
 {selected&&<section className="panel"><div className="section-heading"><h2>{selected.title}</h2><button onClick={()=>setSelected(null)}>← {screen==='review'?'Review 复习':'Books 课本'}</button></div><Practice homeworkSequence={false} spellingScope={studentId+':practice'} sentencePractice={selected.sentencePractice} age={lessonSettings?.[selected.id]?.age||selected.defaultAge} key={selected.id+screen} homework={screen==='books'} vocabulary={selected.words} readings={selected.readings} story={selected.story} readingStory={selected.readingStory} videos={selected.videos} activities={activities} unitId={selected.id} initialProgress={reviewProgress} onActivity={save}/></section>}
 {!selected&&screen!=='daily'&&<nav className="student-bottom-nav" aria-label="Student navigation">{([['home','Home 主页',Home],['rewards','Rewards 奖励',Trophy],['class','My class 班级',Users]] as const).map(([id,label,Icon])=><button key={id} aria-current={screen===id?'page':undefined} onClick={()=>setScreen(id)}><Icon size={22}/><span>{label}</span></button>)}</nav>}
 </div>
}

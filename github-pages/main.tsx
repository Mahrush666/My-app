import {usePublishedLessons} from '../lib/published-lessons';
import {classroomRequest,configuredEndpoint,sessionSaved} from '../lib/classroom-client';
import { lazy, Suspense, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen } from 'lucide-react';
import Teacher from './teacher';
import TeacherGate from './teacher-gate';
import Classroom from './classroom';
import ConnectionTest from './connection-test';
import SupabaseTest from './supabase-test';
import {studentAccess} from '../lib/student-entry';
import {validateSettings,type Settings,configuredActivities} from '../lib/unit-activities';
import Practice from '../app/practice';
import { lessons } from './lessons';
import {bookUnits,lessonLabel} from './lesson-groups';
import '../app/globals.css';
const LocalSpeechTrial=lazy(()=>import('./local-speech-trial'));
function App() {
 const params=new URLSearchParams(location.hash.slice(1));
 const query=new URLSearchParams(location.search);
 const online=(params.get('view')==='classroom'||params.get('view')==='teacher')||query.has('invite')||query.has('claim')||Boolean(studentAccess(new URL(location.href)));
 const student=query.get('student')==='1'||query.has('settings')||params.has('settings');
 const [teacher,setTeacher]=useState(params.get('view')==='materials');
 const [settings,setSettings]=useState<Settings>(()=>{try{return validateSettings(JSON.parse(localStorage.getItem('wordquest-unit-settings-v1')||'{}'),lessons.map(l=>l.id))}catch{return {}}});
 const [shared]=useState<Settings>(()=>{try{return validateSettings(JSON.parse(query.get('settings')||params.get('settings')||'{}'),lessons.map(l=>l.id))}catch{return {}}});
 const initialLesson=lessons.find(l=>l.id===(query.get('unit')||params.get('unit')));
 const [book,setBook]=useState(initialLesson?.book||''),[chapter,setChapter]=useState(initialLesson?.unit?.id||''),[lessonId,setLessonId]=useState(initialLesson?.id||'');
 const published=usePublishedLessons(lessons.map(l=>l.id),!online,!teacher);
 const latestSettings={...settings,...published.settings};
 const latestShared=Object.fromEntries(Object.entries(shared).map(([id,value])=>[id,published.settings[id]||value]));
 async function save(next:Settings,changes:Settings){if(Object.values(next).some(v=>!v.activities.length))throw new Error('Choose an activity in every edited unit.');const session=sessionSaved();if(session?.role!=='teacher')throw Error('Sign in as a teacher to save lesson settings online.');const endpoint=session.endpoint||await configuredEndpoint();const result=await classroomRequest<{settings:Settings}>(endpoint,'/lesson-settings',{settings:changes},session);const merged={...next,...result.settings};localStorage.setItem('wordquest-unit-settings-v1',JSON.stringify(merged));setSettings(merged);published.replace({...published.settings,...result.settings});}
 const visibleLessons=student?lessons.filter(l=>Boolean(shared[l.id])):lessons;
 const selected=visibleLessons.find(l=>l.id===lessonId);
 const books=[...new Set(visibleLessons.map(l=>l.book))];
 const units=bookUnits(visibleLessons,book),currentUnit=units.find(u=>u.id===chapter);
 const menuLessons=visibleLessons.filter(l=>l.book===book&&(!units.length||l.unit?.id===chapter));
 function allBooks(){setBook('');setChapter('');setLessonId('')}
 function openBook(name:string){setBook(name);setChapter('');setLessonId('')}
 if(query.has('speech-trial'))return <Suspense fallback={<main className="app">Opening speaking trial…</main>}><LocalSpeechTrial/></Suspense>;
 if(query.has('supabase-test'))return <main className="app classroom"><SupabaseTest/></main>;
 if(query.has('connection-test'))return <main className="app classroom"><ConnectionTest/></main>;
 if(online)return <main className="app"><Classroom onExit={()=>{location.href=location.pathname}}/></main>;
 return <main className="app learning-app"><header className="top"><a className="brand" href={student?location.pathname+location.search+location.hash:'./'}>✦ Word<span className="brand-accent">Quest</span></a>{!student&&<button onClick={()=>{location.hash='view=teacher'}}>{teacher?'Student view 学生页面':'Teacher view 老师设置'}</button>}</header>
 {teacher&&!student&&<p className="classroom-shortcut"><a className="text-link" href="#view=classroom">Classes, assignments & family accounts 班级与家庭账号 →</a></p>}
 {!teacher&&!selected&&book&&<nav className="lesson-breadcrumbs" aria-label="Lesson location"><button onClick={allBooks}>Books 课本</button><span aria-hidden="true">›</span><button onClick={()=>openBook(book)}>{book}</button>{currentUnit&&<><span aria-hidden="true">›</span><button onClick={()=>setLessonId('')}>{currentUnit.title}</button></>}</nav>}
 {published.error&&<p className="notice" role="status">{published.error} <button onClick={published.retry}>Retry 重试</button></p>}
 {published.loading?<p>Loading the latest lesson… 正在加载最新课程…</p>:teacher&&!student?<TeacherGate><Teacher settings={latestSettings} onSave={save} onExit={()=>{setTeacher(false);history.replaceState(null,'',location.pathname)}}/></TeacherGate>:selected?<><div className="section-heading practice-heading"><div><p className="eyebrow">{selected.book}{selected.unit?' · Unit '+selected.unit.number:''}</p><h2>{lessonLabel(selected)}</h2></div>{visibleLessons.length>1&&<button onClick={()=>setLessonId('')}>Choose lesson 选课程</button>}</div><Practice unitId={selected.id} sentencePractice={selected.sentencePractice} age={(student?latestShared[selected.id]:latestSettings[selected.id])?.age||selected.defaultAge} key={selected.id} vocabulary={selected.words} readings={selected.readings} readingStory={selected.readingStory} story={selected.story} videos={selected.videos} activities={configuredActivities(selected.id,latestShared,latestSettings,student,selected.defaultActivities)}/></>:<>
 <div className="section-heading"><div>{book&&<p className="eyebrow">{currentUnit?.title||book}</p>}<h1>{!book?'Choose your book 选课本':units.length&&!chapter?'Choose a unit 选单元':'Choose a lesson 选课程'}</h1></div>{book&&<button onClick={chapter?()=>setChapter(''):allBooks}>{chapter?'All units 所有单元':'All books 所有课本'}</button>}</div>
 {student&&!visibleLessons.length&&<p className="notice">This student link has no valid lesson settings. Ask your teacher for a new QR code. 请老师重新生成课程二维码。</p>}<div className="lesson-menu">{!book?books.map(b=>{const grouped=bookUnits(visibleLessons,b);return <button key={b} className="lesson-tile" onClick={()=>openBook(b)}><BookOpen size={32}/><strong>{b}</strong><span>{grouped.length?grouped.length+' units 单元':visibleLessons.filter(l=>l.book===b).length+' lessons 课程'}</span></button>}):units.length&&!chapter?units.map(u=><button key={u.id} className="lesson-tile" onClick={()=>setChapter(u.id)}><BookOpen size={32}/><strong>{u.title}</strong><span>{visibleLessons.filter(l=>l.book===book&&l.unit?.id===u.id).length} lessons 课程</span></button>):menuLessons.map(l=><button key={l.id} className="lesson-tile" onClick={()=>setLessonId(l.id)}><BookOpen size={32}/><strong>{lessonLabel(l)}</strong><span>{l.story?l.story.scenes.length+' story pictures':''}{l.words.length>0?l.words.length+' flashcards':''}</span></button>)}</div></>}
 <footer><details className="practice-info"><summary>Progress info 进度说明</summary><p>Practice progress stays on this browser. 练习进度保存在此设备。</p></details></footer></main>
}
function Root(){
 const [route,setRoute]=useState(location.hash);
 useEffect(()=>{const change=()=>setRoute(location.hash);window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 return <App key={route}/>;
}
createRoot(document.getElementById('root')!).render(<Root/>);

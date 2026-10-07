import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen } from 'lucide-react';
import Teacher from './teacher';
import {validateSettings,type Settings,configuredActivities} from '../lib/unit-activities';
import Practice from '../app/practice';
import { lessons } from './lessons';
import '../app/globals.css';
function App() {
 const params=new URLSearchParams(location.hash.slice(1));
 const query=new URLSearchParams(location.search);
 const student=query.get('student')==='1'||query.has('settings')||params.has('settings');
 const [teacher,setTeacher]=useState(params.get('view')==='teacher');
 const [settings,setSettings]=useState<Settings>(()=>{try{return validateSettings(JSON.parse(localStorage.getItem('wordquest-unit-settings-v1')||'{}'),lessons.map(l=>l.id))}catch{return {}}});
 const [shared]=useState<Settings>(()=>{try{return validateSettings(JSON.parse(query.get('settings')||params.get('settings')||'{}'),lessons.map(l=>l.id))}catch{return {}}});
 const [book,setBook]=useState(''), [unit,setUnit]=useState(query.get('unit')||params.get('unit')||'');
 function save(next:Settings){if(Object.values(next).some(v=>!v.activities.length))throw new Error('Choose an activity in every edited unit.');localStorage.setItem('wordquest-unit-settings-v1',JSON.stringify(next));setSettings(next)}
 const visibleLessons=student?lessons.filter(l=>Boolean(shared[l.id])):lessons;
 const selected=visibleLessons.find(l=>l.id===unit);
 const books=[...new Set(visibleLessons.map(l=>l.book))];
 return <main className="app"><header className="top"><a className="brand" href={student?location.pathname+location.search+location.hash:'./'}>✦ Word<span className="brand-accent">Quest</span></a>{!student&&<button onClick={()=>{setTeacher(!teacher);history.replaceState(null,'',teacher?location.pathname:location.pathname+'#view=teacher')}}>{teacher?'Student view 学生页面':'Teacher view 老师设置'}</button>}</header>
 <p className="small-note">Practice progress stays on this browser. 本次练习进度保存在此设备。 Online teacher reports are not connected yet.</p>
 {teacher&&!student?<Teacher settings={settings} onSave={save} onExit={()=>{setTeacher(false);history.replaceState(null,'',location.pathname)}}/>:selected?<><div className="section-heading"><div><p className="eyebrow">{selected.book}</p><h2>{selected.title}</h2></div>{visibleLessons.length>1&&<button onClick={()=>setUnit('')}>Choose lesson 选课程</button>}</div><Practice key={selected.id} vocabulary={selected.words} readings={selected.readings} story={selected.story} activities={configuredActivities(selected.id,shared,settings,student,selected.defaultActivities)}/></>:<>
 <div className="section-heading"><h1>{book?'Choose a unit 选单元':'Choose your book 选课本'}</h1>{book&&<button onClick={()=>setBook('')}>All books 所有课本</button>}</div>
 {student&&!visibleLessons.length&&<p className="notice">This student link has no valid lesson settings. Ask your teacher for a new QR code. 请老师重新生成课程二维码。</p>}<div className="lesson-menu">{book?visibleLessons.filter(l=>l.book===book).map(l=><button key={l.id} className="lesson-tile" onClick={()=>setUnit(l.id)}><BookOpen size={32}/><strong>{l.title}</strong><span>{l.story?`${l.story.scenes.length} story pictures${l.words.length?' · ':''}`:''}{l.words.length>0?`${l.words.length} flashcards`:''}{configuredActivities(l.id,shared,settings,student).includes('reading')?` · ${l.readings.length} reading paragraphs`:''}</span></button>):books.map(b=><button key={b} className="lesson-tile" onClick={()=>setBook(b)}><BookOpen size={32}/><strong>{b}</strong><span>{visibleLessons.filter(l=>l.book===b).length} units 单元</span></button>)}</div></>}
 <footer>Learn a little. Play a little. 每天学一点，玩一点。</footer></main>
}
function Root(){
 const [route,setRoute]=useState(location.hash);
 useEffect(()=>{const change=()=>setRoute(location.hash);window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 return <App key={route}/>;
}
createRoot(document.getElementById('root')!).render(<Root/>);

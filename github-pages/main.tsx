import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen } from 'lucide-react';
import Practice from '../app/practice';
import { lessons } from './lessons';
import '../app/globals.css';
function App() {
 const [book,setBook]=useState(''), [unit,setUnit]=useState('');
 const selected=lessons.find(l=>l.id===unit);
 const books=[...new Set(lessons.map(l=>l.book))];
 return <main className="app"><header className="top"><a className="brand" href="./">✦ Word<span className="brand-accent">Quest</span></a><span className="pill">English adventures 英语冒险</span></header>
 <p className="small-note">Practice progress stays on this browser. 本次练习进度保存在此设备。 Online teacher reports are not connected yet.</p>
 {selected?<><div className="section-heading"><div><p className="eyebrow">{selected.book}</p><h2>{selected.title}</h2></div><button onClick={()=>setUnit('')}>Choose lesson 选课程</button></div><Practice key={selected.id} vocabulary={selected.words} readings={selected.readings}/></>:<>
 <div className="section-heading"><h1>{book?'Choose a unit 选单元':'Choose your book 选课本'}</h1>{book&&<button onClick={()=>setBook('')}>All books 所有课本</button>}</div>
 <div className="lesson-menu">{book?lessons.filter(l=>l.book===book).map(l=><button key={l.id} className="lesson-tile" onClick={()=>setUnit(l.id)}><BookOpen size={32}/><strong>{l.title}</strong><span>{l.words.length} words · {l.readings.length} reading paragraphs</span></button>):books.map(b=><button key={b} className="lesson-tile" onClick={()=>setBook(b)}><BookOpen size={32}/><strong>{b}</strong><span>{lessons.filter(l=>l.book===b).length} units 单元</span></button>)}</div></>}
 <footer>Learn a little. Play a little. 每天学一点，玩一点。</footer></main>
}
createRoot(document.getElementById('root')!).render(<App/>);

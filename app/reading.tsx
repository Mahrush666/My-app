"use client";
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2 } from 'lucide-react';
import { passages } from './passages';
import { speak, stopSpeaking } from './words';
import { storyIllustration } from '@/lib/story-illustrations';

export default function Reading({lessonPassages=passages,onComplete,onRead,readIds:externalReadIds}:{lessonPassages?:typeof passages;unitId?:string;onComplete?:(passage:typeof passages[number])=>void;onRead?:(passage:typeof passages[number])=>void;readIds?:string[]}){
 const [id,setId]=useState(lessonPassages[0]?.id||'');
 const [completed,setCompleted]=useState<string[]>([]);
 const readIds=externalReadIds||completed;
 const p=lessonPassages.find(x=>x.id===id)||lessonPassages[0];
 const position=Math.max(0,lessonPassages.findIndex(x=>x.id===p?.id));
 const illustration=storyIllustration(p?.text||'');
 useEffect(()=>()=>stopSpeaking(),[]);
 function choose(value:string){stopSpeaking();setId(value)}
 function markRead(){if(!p||readIds.includes(p.id))return;setCompleted(ids=>[...ids,p.id]);onRead?.(p);onComplete?.(p)}
 if(!p)return <div className="empty"><h2>No story in this unit yet.</h2><p>Your teacher can add one. 老师可以添加故事。</p></div>;
 return <>
 <div className="section-heading"><div><p className="eyebrow">STORY TIME</p><h2>Read & listen 阅读与听故事</h2></div><span className="pill">{position+1} / {lessonPassages.length}</span></div>
 <Tabs value={p.id} onValueChange={choose}><TabsList className="reading-levels">{lessonPassages.map((x,i)=><TabsTrigger key={x.id} value={x.id} aria-label={x.title}>{lessonPassages.length>3?i+1:x.level}</TabsTrigger>)}</TabsList></Tabs>
 <div className="paragraph-navigation"><button disabled={position===0} onClick={()=>choose(lessonPassages[position-1].id)}>Previous 上一段</button><span>{position+1} / {lessonPassages.length}</span><button disabled={position===lessonPassages.length-1} onClick={()=>choose(lessonPassages[position+1].id)}>Next 下一段</button></div>
 <section className="reading-surface"><div className="quiz-top"><h3>{p.title}</h3><button onClick={()=>speak(p.text)} aria-label="Listen to the passage"><Volume2/> Listen 听一听</button></div>
 <div className={illustration?'illustrated-paragraph':''}>{illustration&&<img key={illustration.src} className="paragraph-illustration" src={illustration.src} alt={illustration.alt} width={300} height={200}/>}<div><p className="passage">{p.text}</p><p className="chinese-hint" lang="zh-CN">{p.hint}</p></div></div>
 <button className="paragraph-read" disabled={readIds.includes(p.id)} onClick={markRead}>{readIds.includes(p.id)?'✓ Paragraph practised 已练习':'I have practised this paragraph 我已练习这段'}</button>
 </section></>;
}

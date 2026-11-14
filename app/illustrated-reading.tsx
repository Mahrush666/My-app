import FinishCelebration from './finish-celebration';
"use client";
import {useEffect,useState,useRef,lazy,Suspense} from 'react';
const BeehiveMission=lazy(()=>import('./beehive-missions'));
const VolcanoMission=lazy(()=>import('./volcano-mission'));
const CashierGame=lazy(()=>import('./cashier-game'));
import {Volume2,ArrowLeft,ArrowRight} from 'lucide-react';
import './volcano-mission.css';
import {speak,stopSpeaking,playAnswerSound} from '../lib/audio';
import {publicAsset} from '../lib/public-runtime';
import {checkStoryAnswer,type IllustratedReading} from '../lib/illustrated-reading';
export function StoryReader({story}:{story:IllustratedReading}){
 const [index,setIndex]=useState(0),[active,setActive]=useState(-1),[readDone,setReadDone]=useState(false);
 useEffect(()=>()=>stopSpeaking(),[]);
 const reader=useRef<HTMLElement>(null);
 const pauseAudio=(except?:HTMLAudioElement)=>reader.current?.querySelectorAll('audio').forEach(audio=>{if(audio!==except)audio.pause()});
 const scene=story.scenes[index];
 function move(n:number){pauseAudio();stopSpeaking();setIndex(n);setActive(-1)}
 return <section className="story-reader" ref={reader}>{story.audio&&<div className="source-story-audio"><span>Original story audio 故事原音</span><audio controls preload="none" src={publicAsset(story.audio)} onPlay={e=>{stopSpeaking();pauseAudio(e.currentTarget)}}/></div>}<div className="story-toolbar"><span>{index+1} / {story.scenes.length}</span></div><img className="reading-scene" src={publicAsset(scene.image)} alt={scene.label}/><div className="story-sentences">{scene.full.map((text,i)=><button key={text} className={active===i?'is-speaking':''} onClick={()=>{pauseAudio();setActive(i);speak(text)}} aria-label={'Listen: '+text}><Volume2 size={20}/><span>{text}</span></button>)}</div><div className="story-toolbar"><button disabled={index===0} onClick={()=>move(index-1)}><ArrowLeft/>Back</button><button className="primary" onClick={()=>{if(index===story.scenes.length-1){pauseAudio();stopSpeaking();setReadDone(true)}else move(index+1)}}>{index===story.scenes.length-1?'Finish 完成':'Next'}<ArrowRight/></button></div>{readDone&&<FinishCelebration/>}{story.references?.length&&<details className="story-resources"><summary>Grammar & listening 语法与听力</summary>{story.references.map(r=><section key={r.title}><h3>{r.title}</h3><img src={publicAsset(r.image)} alt={r.title} loading="lazy"/><audio controls preload="none" src={publicAsset(r.audio)} onPlay={e=>{stopSpeaking();pauseAudio(e.currentTarget)}}/></section>)}</details>}</section>
}
export function StoryPractice(props:{answeredItems?:string[];story:IllustratedReading;activities:string[];onAnswer:(activity:string,item:string,answer:string,correct:boolean)=>Promise<void>}){return props.story.rounds?.length&&props.activities.includes('story-quiz')?<StoryRounds {...props}/>:<StoryPracticeBody {...props}/>;}
function StoryPracticeBody({story,activities,onAnswer}:{story:IllustratedReading;activities:string[];onAnswer:(activity:string,item:string,answer:string,correct:boolean)=>Promise<void>}){
 const modes=['story-quiz','story-order'].filter(a=>activities.includes(a));
 const [mode,setMode]=useState(modes[0]);
 useEffect(()=>()=>stopSpeaking(),[]);
 useEffect(()=>{if(!modes.includes(mode))setMode(modes[0])},[activities,mode]);
 return <section className="story-practice">{modes.length>1&&<div className="story-mode"><button aria-pressed={mode==='story-quiz'} onClick={()=>{stopSpeaking();setMode('story-quiz')}}>Questions 问答</button><button aria-pressed={mode==='story-order'} onClick={()=>{stopSpeaking();setMode('story-order')}}>Put in order 排序</button></div>}{modes.map(m=><div key={m} hidden={mode!==m}><StoryQuestions story={story} mode={m} onAnswer={onAnswer}/></div>)}</section>
}
function StoryRounds({story,onAnswer,answeredItems}:{answeredItems?:string[];story:IllustratedReading;activities:string[];onAnswer:(activity:string,item:string,answer:string,correct:boolean)=>Promise<void>}){
 const [selected,setSelected]=useState<string|null>(null),[passed,setPassed]=useState<string[]>(answeredItems||[]);
 const answeredKey=(answeredItems||[]).join('|');useEffect(()=>{setPassed(ids=>[...new Set([...ids,...(answeredItems||[])])])},[answeredKey]);
 const round=story.rounds!.find(r=>r.id===selected),questions=round?story.questions.filter(q=>round.questionIds.includes(q.id)):[];
 return round?<><button className="volcano-round-exit" onClick={()=>{stopSpeaking();setSelected(null)}}>← Choose a round 选择小回合</button><h3>{round.title}</h3><StoryPracticeBody key={round.id} story={{...story,rounds:undefined,questions}} activities={['story-quiz']} onAnswer={async(...args)=>{await onAnswer(...args);if(args[3])setPassed(ids=>[...new Set([...ids,args[1]])])}}/></>:<div className="volcano-rounds"><h3>Choose a short adventure 选择一个小冒险</h3><p>Four questions per round. Take a break between rounds. 每回合四题，可以分次完成。</p>{story.rounds!.map(r=>{const count=r.questionIds.filter(id=>passed.includes(id)).length;return <button className={count===r.questionIds.length?'round-done':''} key={r.id} onClick={()=>setSelected(r.id)}><span>{r.title}<small>{count} / {r.questionIds.length} · {count===r.questionIds.length?'Done! 再玩一次':'Questions answered 已答题'}</small></span><span aria-hidden="true">{count===r.questionIds.length?'✓':'→'}</span></button>})}</div>
}
function StoryQuestions({story,mode,onAnswer}:{story:IllustratedReading;mode:string;onAnswer:(activity:string,item:string,answer:string,correct:boolean)=>Promise<void>}){
 const [index,setIndex]=useState(0),[choice,setChoice]=useState<number|null>(null),[order,setOrder]=useState<string[]>([]),[feedback,setFeedback]=useState(''),[correct,setCorrect]=useState(false),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[help,setHelp]=useState(false);
 const isQuiz=mode==='story-quiz',items=isQuiz?story.questions:story.orders,item=items[index],q=story.questions[index],round=story.orders[index];
 const scene=isQuiz?story.scenes.find(s=>s.id===q.scene):undefined;
 const cashier=isQuiz&&q.cashier;
 const submitting=useRef(false);
 async function check(selected=choice){
  if(submitting.current||correct)return;
  const answer=isQuiz?String(selected):order.join(',');
  const result=checkStoryAnswer(story,mode,item.id,answer);
  if(result===null)return;
  submitting.current=true;
  if(cashier&&result)speak(q.explanation);else playAnswerSound(result);
  setBusy(true);setFeedback('');
  try{await onAnswer(mode,item.id,answer,result);setCorrect(result);setFeedback(result?(cashier?'Order served! 送对啦！':'Good job! 答对了！'):(cashier?'Try another item. 再选一次。':'Try again 再试一次'));}
  catch{setFeedback(cashier?'Could not save. Give the item again. 保存失败，请再试。':'Could not save. Tap OK to try again. 保存失败，请再点 OK。');}
  finally{submitting.current=false;setBusy(false)}
 }
 function next(){
  stopSpeaking();
  if(index===items.length-1){setDone(true);return}
  setIndex(index+1);setChoice(null);setOrder([]);setFeedback('');setCorrect(false);setHelp(false);
  if(cashier)speak(story.questions[index+1].text);
 }
 if(done)return <div className="story-done" role="status"><FinishCelebration/><h3>⭐ Finished! 已完成！</h3><button onClick={()=>{setIndex(0);setChoice(null);setOrder([]);setFeedback('');setCorrect(false);setDone(false);setHelp(false)}}>Practice again 再练习</button></div>;
 // Fixed shuffled positions keep pictures stable across taps, with no chronological numbering.
 const pictures=isQuiz?[]:round.scenes.map((_,i)=>round.scenes[(i+2)%round.scenes.length]);
 return <div className="story-question">{isQuiz&&story.quizTitle&&<p>Pick the word that fits. 选择正确的单词。</p>}<div className="story-toolbar"><span>{index+1} / {items.length}</span>{!isQuiz&&<button aria-pressed={help} onClick={()=>setHelp(!help)}>Picture hints 提示</button>}</div>{isQuiz?(cashier?<Suspense fallback={<p role="status">Opening the shop… 正在打开商店…</p>}><CashierGame key={q.id} question={q} image={scene!.image} choice={choice} busy={busy} correct={correct} onSelect={i=>{setChoice(i);setFeedback('')}} onGive={i=>{setChoice(i);void check(i)}}/></Suspense>:q.mission?<Suspense fallback={<p role="status">Opening mission… 正在打开…</p>}>{q.mission.kind==='volcano'?<VolcanoMission key={q.id} question={q} image={scene!.image} choice={choice} onSelect={i=>{setChoice(i);setFeedback('')}} correct={correct} busy={busy}/>:<BeehiveMission key={q.id} question={q} image={scene!.image} choice={choice} onSelect={i=>{setChoice(i);setFeedback('')}} correct={correct} busy={busy}/>}</Suspense>:q.listenOnly?<ListeningStoryQuestion question={q} choice={choice} disabled={busy||correct} onSelect={i=>{setChoice(i);setFeedback('')}}/>:<><img className="reading-scene" src={publicAsset(scene!.image)} alt="Story illustration"/><div className="story-question-title"><h3>{q.text}</h3><button className="icon-button" aria-label="Listen to the question" onClick={()=>speak(q.text)}><Volume2/></button></div><div className="story-choices">{q.options.map((text,i)=><div key={text}><button aria-pressed={choice===i} disabled={busy||correct} onClick={()=>{setChoice(i);setFeedback('')}}>{text}</button><button className="icon-button" aria-label={'Listen: '+text} onClick={()=>speak(text)}><Volume2/></button></div>)}</div></>):<><h3>What happens first? 接下来呢？</h3><p>Tap the pictures in story order. 按故事顺序点击图片。</p><div className="story-order-pictures">{pictures.map(id=>{const s=story.scenes.find(s=>s.id===id)!;const pos=order.indexOf(id);return <div key={id}><button aria-label={'Choose picture: '+s.label} aria-pressed={pos>=0} disabled={busy||correct} onClick={()=>{setOrder(prev=>pos>=0?prev.filter(x=>x!==id):[...prev,id]);setFeedback('')}}><img src={publicAsset(s.image)} alt={help?s.label:'Story picture'}/><span className="order-number">{pos>=0?pos+1:'+'}</span></button>{help&&<button className="story-hint" onClick={()=>speak(s.label)}><Volume2 size={18}/>{s.label}</button>}</div>})}</div>{order.length>0&&!correct&&<button disabled={busy} onClick={()=>{setOrder([]);setFeedback('')}}>Clear 重选</button>}</>}
 <p className="feedback" role="status">{feedback}</p>{correct&&isQuiz&&!cashier&&<p className="story-explanation">{q.explanation}<button className="icon-button" aria-label="Listen to explanation" onClick={()=>speak(q.explanation)}><Volume2/></button></p>}{correct?<button className="primary" onClick={next}>{index===items.length-1?'Finish 完成':(cashier?'Next customer 下一位顾客':'Next 下一题')}</button>:!cashier&&<button className="primary" disabled={busy||(isQuiz?choice===null:order.length!==round.scenes.length)} onClick={()=>void check()}>{busy?'Saving…':'OK 确定'}</button>}</div>
}

function ListeningStoryQuestion({question,choice,disabled,onSelect}:{
 question:IllustratedReading['questions'][number];
 choice:number|null;
 disabled:boolean;
 onSelect:(index:number)=>void;
}){
 const pictures=question.optionImages;
 return <>
  <h3>{pictures?'Listen and pick the item. 听一听，选物品。':'Look and choose what to say. 看图片，选句子。'}</h3>
  {question.picture&&<img className="reading-scene" style={{maxWidth:240,marginInline:'auto'}} src={publicAsset(question.picture)} alt="Picture for the question"/>}
  <button className="secondary" onClick={()=>speak(question.text)}><Volume2 size={20}/> Listen 听一听</button>
  <div className={pictures?'story-order-pictures story-listening-pictures':'story-choices'}>
   {question.options.map((option,i)=><div key={option}>
    <button type="button" aria-pressed={choice===i} disabled={disabled} onClick={()=>{if(!pictures)speak(option);onSelect(i)}} aria-label={pictures?option:'Listen to and select answer '+(i+1)}>
     {pictures?<img src={publicAsset(pictures[i])} alt=""/>:<><Volume2 size={20}/> {i+1}</>}
    </button>
   </div>)}
  </div>
 </>;
}

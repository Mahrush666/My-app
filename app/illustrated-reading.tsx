"use client";
import {useEffect,useState} from 'react';
import {Volume2,ArrowLeft,ArrowRight} from 'lucide-react';
import {speak,stopSpeaking,playAnswerSound} from '../lib/audio';
import {publicAsset} from '../lib/public-runtime';
import {checkStoryAnswer,type IllustratedReading} from '../lib/illustrated-reading';
export function StoryReader({story}:{story:IllustratedReading}){
 const [index,setIndex]=useState(0),[easy,setEasy]=useState(true),[active,setActive]=useState(-1);
 useEffect(()=>()=>stopSpeaking(),[]);
 const scene=story.scenes[index];
 function move(n:number){stopSpeaking();setIndex(n);setActive(-1)}
 return <section className="story-reader"><div className="story-toolbar"><span>{index+1} / {story.scenes.length}</span><div className="story-mode" aria-label="Reading support"><button aria-pressed={easy} onClick={()=>{stopSpeaking();setEasy(true);setActive(-1)}}>Short text 简易</button><button aria-pressed={!easy} onClick={()=>{stopSpeaking();setEasy(false);setActive(-1)}}>Full text 完整</button></div></div><img className="reading-scene" src={publicAsset(scene.image)} alt={scene.label}/><div className="story-sentences">{(easy?scene.easy:scene.full).map((text,i)=><button key={text} className={active===i?'is-speaking':''} onClick={()=>{setActive(i);speak(text)}} aria-label={'Listen: '+text}><Volume2 size={20}/><span>{text}</span></button>)}</div><div className="story-toolbar"><button disabled={index===0} onClick={()=>move(index-1)}><ArrowLeft/>Back</button><button className="primary" disabled={index===story.scenes.length-1} onClick={()=>move(index+1)}>Next<ArrowRight/></button></div></section>
}
export function StoryPractice({story,activities,onAnswer}:{story:IllustratedReading;activities:string[];onAnswer:(activity:string,item:string,answer:string,correct:boolean)=>Promise<void>}){
 const modes=['story-quiz','story-order'].filter(a=>activities.includes(a));
 const [mode,setMode]=useState(modes[0]);
 useEffect(()=>()=>stopSpeaking(),[]);
 useEffect(()=>{if(!modes.includes(mode))setMode(modes[0])},[activities,mode]);
 return <section className="story-practice">{modes.length>1&&<div className="story-mode"><button aria-pressed={mode==='story-quiz'} onClick={()=>{stopSpeaking();setMode('story-quiz')}}>Questions 问答</button><button aria-pressed={mode==='story-order'} onClick={()=>{stopSpeaking();setMode('story-order')}}>Put in order 排序</button></div>}{modes.map(m=><div key={m} hidden={mode!==m}><StoryQuestions story={story} mode={m} onAnswer={onAnswer}/></div>)}</section>
}
function StoryQuestions({story,mode,onAnswer}:{story:IllustratedReading;mode:string;onAnswer:(activity:string,item:string,answer:string,correct:boolean)=>Promise<void>}){
 const [index,setIndex]=useState(0),[choice,setChoice]=useState<number|null>(null),[order,setOrder]=useState<string[]>([]),[feedback,setFeedback]=useState(''),[correct,setCorrect]=useState(false),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[help,setHelp]=useState(false);
 const isQuiz=mode==='story-quiz',items=isQuiz?story.questions:story.orders,item=items[index],q=story.questions[index],round=story.orders[index];
 const scene=isQuiz?story.scenes.find(s=>s.id===q.scene):undefined;
 async function check(){if(busy||correct)return;const answer=isQuiz?String(choice):order.join(',');const result=checkStoryAnswer(story,mode,item.id,answer);if(result===null)return;playAnswerSound(result);setBusy(true);setFeedback('');try{await onAnswer(mode,item.id,answer,result);setCorrect(result);setFeedback(result?'Good job! 答对了！':'Try again 再试一次');}catch{setFeedback('Could not save. Tap OK to try again. 保存失败，请再点 OK。')}finally{setBusy(false)}}
 function next(){stopSpeaking();if(index===items.length-1){setDone(true);return}setIndex(index+1);setChoice(null);setOrder([]);setFeedback('');setCorrect(false);setHelp(false)}
 if(done)return <div className="story-done" role="status"><h3>⭐ Finished! 已完成！</h3><button onClick={()=>{setIndex(0);setChoice(null);setOrder([]);setFeedback('');setCorrect(false);setDone(false);setHelp(false)}}>Practice again 再练习</button></div>;
 // Fixed shuffled positions keep pictures stable across taps, with no chronological numbering.
 const pictures=isQuiz?[]:[round.scenes[2],round.scenes[0],round.scenes[1]];
 return <div className="story-question"><div className="story-toolbar"><span>{index+1} / {items.length}</span>{!isQuiz&&<button aria-pressed={help} onClick={()=>setHelp(!help)}>Picture hints 提示</button>}</div>{isQuiz?<><img className="reading-scene" src={publicAsset(scene!.image)} alt="Story illustration"/><div className="story-question-title"><h3>{q.text}</h3><button className="icon-button" aria-label="Listen to the question" onClick={()=>speak(q.text)}><Volume2/></button></div><div className="story-choices">{q.options.map((text,i)=><div key={text}><button aria-pressed={choice===i} disabled={busy||correct} onClick={()=>{setChoice(i);setFeedback('')}}>{text}</button><button className="icon-button" aria-label={'Listen: '+text} onClick={()=>speak(text)}><Volume2/></button></div>)}</div></>:<><h3>What happens first? 接下来呢？</h3><p>Tap the pictures in story order. 按故事顺序点击图片。</p><div className="story-order-pictures">{pictures.map(id=>{const s=story.scenes.find(s=>s.id===id)!;const pos=order.indexOf(id);return <div key={id}><button aria-label={'Choose picture: '+s.label} aria-pressed={pos>=0} disabled={busy||correct} onClick={()=>{setOrder(prev=>pos>=0?prev.filter(x=>x!==id):[...prev,id]);setFeedback('')}}><img src={publicAsset(s.image)} alt={help?s.label:'Story picture'}/><span className="order-number">{pos>=0?pos+1:'+'}</span></button>{help&&<button className="story-hint" onClick={()=>speak(s.label)}><Volume2 size={18}/>{s.label}</button>}</div>})}</div>{order.length>0&&!correct&&<button disabled={busy} onClick={()=>{setOrder([]);setFeedback('')}}>Clear 重选</button>}</>}
 <p className="feedback" role="status">{feedback}</p>{correct&&isQuiz&&<p className="story-explanation">{q.explanation}<button className="icon-button" aria-label="Listen to explanation" onClick={()=>speak(q.explanation)}><Volume2/></button></p>}{correct?<button className="primary" onClick={next}>{index===items.length-1?'Finish 完成':'Next 下一题'}</button>:<button className="primary" disabled={busy||(isQuiz?choice===null:order.length!==round.scenes.length)} onClick={()=>void check()}>{busy?'Saving…':'OK 确定'}</button>}</div>
}

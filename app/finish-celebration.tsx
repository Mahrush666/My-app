import {useEffect,useState} from 'react';
import {celebrateSound} from '../lib/celebration';
import './finish-celebration.css';
export function DoneSticker(){return <span className="done-sticker" aria-label="Finished 已完成">★ DONE <small>完成</small></span>}
export default function FinishCelebration({title='Amazing work! 太棒了！',kind='exercise'}:{title?:string;kind?:'exercise'|'round'}){
 const [visible,setVisible]=useState(true);
 useEffect(()=>{window.dispatchEvent(new CustomEvent('wordquest-exercise-finished',{detail:{kind}}));celebrateSound();const timer=setTimeout(()=>setVisible(false),3200);return()=>clearTimeout(timer)},[]);
 if(!visible)return null;
 return <div className="finish-celebration" role="status" aria-live="polite"><div className="celebration-confetti" aria-hidden="true">{Array.from({length:22},(_,i)=><i key={i} style={{'--x':`${(i*37)%100}%`,'--delay':`${i%6*.09}s`,'--color':['#7c3aed','#fbbf24','#2dd4bf','#fb7185'][i%4],'--spin':`${i*47}deg`} as React.CSSProperties}/>)}</div><div className="celebration-message"><span aria-hidden="true">🏆</span><strong>{title}</strong><button aria-label="Close celebration" onClick={()=>setVisible(false)}>×</button></div></div>
}

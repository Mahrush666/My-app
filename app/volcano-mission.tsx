import {useEffect,useState} from 'react';
import {Volume2,Lightbulb} from 'lucide-react';
import {speak} from '../lib/audio';
import {publicAsset} from '../lib/public-runtime';
import type {IllustratedReading} from '../lib/illustrated-reading';
import './volcano-mission.css';
const art=(name:string)=>publicAsset('lessons/play2-u4-lesson3/art/'+name+'.webp');
const volcanoStages=['volcano-empty','volcano','volcano-powder','volcano-liquid','bubbles'];
const monsterStages=['monster-body','monster-eye','monster-hands','monster-1','monster-1'];
type Question=IllustratedReading['questions'][number];
export default function VolcanoMission({question:q,image,choice,onSelect,correct,busy}:{question:Question;image:string;choice:number|null;onSelect:(i:number|null)=>void;correct:boolean;busy:boolean}){
 const [hint,setHint]=useState(false);const m=q.mission!,step=m.step||0,stage=step+(correct?1:0),locked=busy||correct;
 useEffect(()=>{const names=m.task==='step'?volcanoStages:m.task==='monster'?monsterStages:[];for(const name of new Set(names)){const picture=new Image();picture.src=art(name)}},[m.task]);
 const title=m.task==='bag'?'Pack the scientist’s bag 实验准备':m.task==='step'?'Make the volcano 火山冒险':m.task==='monster'?'Build a silly monster 怪兽工坊':'Senses detective 感官侦探';
 return <section className={'volcano-mission task-'+m.task+(correct?' is-solved':'')}><header><span aria-hidden="true">{m.task==='bag'?'🎒':m.task==='step'?'🌋':m.task==='monster'?'👾':'🔍'}</span><h3>{title}</h3></header>
 {m.task==='bag'?<div className="volcano-tray" aria-label={'Materials collected: '+stage+' of 4'}>{['vinegar','baking-soda','coloring','sand'].map((name,i)=><div key={name}>{i<stage?<img src={art(name)} alt="Collected material"/>:<span aria-hidden="true">＋</span>}</div>)}</div>:m.task==='step'?<div className={'volcano-build stage-'+stage} aria-label={'Volcano step '+stage+' of 4'}><img className="volcano-stage-art" src={art(volcanoStages[stage])} alt={stage===4?'A volcano with red bubbles':stage>0?'Your model volcano':'An empty experiment tray'}/>{stage===4&&<div className="volcano-bubbles" aria-hidden="true"><i className="bubble-float b1"/><i className="bubble-float b2"/><i className="bubble-float b3"/></div>}<p>{stage===4?'Bubbles! You did it! 泡泡冒出来啦！':stage===0?'Let’s make a model volcano! 一起做火山模型！':stage===1?'Volcano ready! 火山模型准备好了！':stage===2?'Baking soda is inside! 放好小苏打啦！':'A little vinegar… 加一点醋……'}</p></div>:m.task==='monster'?<div className="monster-builder" aria-label={'Monster parts added: '+stage+' of 4'}><img className="monster-stage-art" src={art(monsterStages[stage])} alt={stage===4?'Finished purple monster':'Your growing purple monster'}/><p>{stage===4?'Our monster is ready! 怪兽完成啦！':'Listen and add a part. 听描述，添加身体部位。'}</p></div>:<img className="volcano-prompt" src={publicAsset(m.object||image)} alt="Look carefully at the experiment"/>}
 <button className="primary volcano-listen" aria-label="Listen to the mission" onClick={()=>speak(q.text)}><Volume2 size={21}/>Listen 听一听</button>
 <p className="volcano-question-text">{q.text}</p>
 {m.model&&<><button className="volcano-hint" aria-pressed={hint} onClick={()=>{setHint(!hint);if(!hint)speak(m.model!)}}><Lightbulb size={18}/>Show me how 示范</button>{hint&&<p className="volcano-model">{m.model}</p>}</>}
 <div className={'volcano-options'+(m.choices?' picture-options':' audio-options')} role="group" aria-label="Mission answers">{q.options.map((text,i)=><button key={text} disabled={locked} aria-pressed={choice===i} aria-label={m.choices?'Choose picture '+(i+1):'Listen to answer '+(i+1)} onClick={()=>{onSelect(i);speak(text)}}>{m.choices?<img src={publicAsset(m.choices[i])} alt="" loading="lazy"/>:<Volume2 size={30}/>}<span className="volcano-option-number" aria-hidden="true">{i+1}</span></button>)}</div>
 </section>;
}

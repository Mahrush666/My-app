import {useRef,useState,type PointerEvent} from 'react';
import {ShoppingBag,Volume2} from 'lucide-react';
import {speak} from '../lib/audio';
import type {IllustratedReading} from '../lib/illustrated-reading';
import {publicAsset} from '../lib/public-runtime';
import './cashier-game.css';

type Drag = {pointer:number;index:number;x:number;y:number;moved:boolean};

export default function CashierGame({question,image,choice,busy,correct,onSelect,onGive}:{
 question:IllustratedReading['questions'][number];
 image:string;
 choice:number|null;
 busy:boolean;
 correct:boolean;
 onSelect:(index:number)=>void;
 onGive:(index:number)=>void;
}){
 const drag=useRef<Drag|null>(null),target=useRef<HTMLButtonElement>(null);
 const ignoreClick=useRef<number|null>(null);
 const [held,setHeld]=useState<{index:number;x:number;y:number;over:boolean}|null>(null);
 const disabled=busy||correct;
 const pictures=question.optionImages!;
 const overCustomer=(x:number,y:number)=>{
  const hit=target.current?.ownerDocument.elementFromPoint(x,y);
  return !!hit&&!!target.current?.contains(hit);
 };

 function start(e:PointerEvent<HTMLButtonElement>,index:number){
  if(disabled||e.button!==0||!e.isPrimary||drag.current)return;
  ignoreClick.current=null;
  e.currentTarget.setPointerCapture(e.pointerId);
  drag.current={pointer:e.pointerId,index,x:e.clientX,y:e.clientY,moved:false};
 }
 function move(e:PointerEvent<HTMLButtonElement>){
  const active=drag.current;
  if(!active||active.pointer!==e.pointerId)return;
  if(!active.moved&&Math.hypot(e.clientX-active.x,e.clientY-active.y)<7)return;
  active.moved=true;
  setHeld({index:active.index,x:e.clientX,y:e.clientY,over:overCustomer(e.clientX,e.clientY)});
 }
 function stop(e:PointerEvent<HTMLButtonElement>,drop=false){
  const active=drag.current;
  if(!active||active.pointer!==e.pointerId)return;
  drag.current=null;
  setHeld(null);
  if(!active.moved)return;
  ignoreClick.current=active.index;
  if(drop&&!disabled&&overCustomer(e.clientX,e.clientY))onGive(active.index);
 }
 return <div className="cashier-game">
  <div className="cashier-heading">
   <div><h3><ShoppingBag size={21} aria-hidden="true"/> You’re the cashier!</h3>
    <p>Listen. Drag the item to the customer, or tap the item and then the customer. 听一听，把商品拖给顾客，也可以先点商品再点顾客。</p></div>
   <button className="secondary" onClick={()=>speak(question.text)}><Volume2 size={20}/> Hear the order 听订单</button>
  </div>
  <button type="button" ref={target} className="cashier-customer" data-over={held?.over||false}
   data-ready={choice!==null&&!disabled} disabled={disabled}
   aria-label={choice===null?'Customer: listen to the order':'Give '+question.options[choice]+' to the customer'}
   onClick={()=>choice===null?speak(question.text):onGive(choice)}>
   <img src={publicAsset(image)} alt="" draggable={false}/>
   {correct?<img className="cashier-delivered" src={publicAsset(pictures[question.answer])} alt={question.options[question.answer]}/>:<span className="cashier-target-label">Give it here 给顾客</span>}
  </button>
  {correct?<div className="cashier-dialogue" aria-live="polite">
   <p><small>Cashier 收银员</small>Sure! Here you are!</p>
   <p><small>Customer 顾客</small>Thank you!</p>
   <button className="icon-button" aria-label="Replay the dialogue" onClick={()=>speak(question.explanation)}><Volume2 size={21}/></button>
  </div>:<div className="cashier-shelf" aria-label="Items on the shelf">
   {question.options.map((option,i)=><button type="button" key={option} disabled={disabled}
    aria-label={option} aria-pressed={choice===i}
    onPointerDown={e=>start(e,i)} onPointerMove={move} onPointerUp={e=>stop(e,true)}
    onPointerCancel={stop} onLostPointerCapture={stop}
    onClick={e=>{if(e.detail!==0&&ignoreClick.current===i){ignoreClick.current=null;return}onSelect(i)}}>
    <img src={publicAsset(pictures[i])} alt="" draggable={false}/>
   </button>)}
  </div>}
  {held&&<img className="cashier-held" style={{left:held.x,top:held.y}} src={publicAsset(pictures[held.index])} alt="" aria-hidden="true"/>}
 </div>;
}

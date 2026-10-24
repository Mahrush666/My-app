import type {D1Database} from '@cloudflare/workers-types';
import {lessons} from '../github-pages/lessons';
import {studentHomeworkProgress} from '../lib/student-homework-progress';
import {chinaWeek} from '../lib/student-dashboard';
export async function readStudentProgress(db:D1Database,childId:string,assignments:any[],completed:any[]){
 if(!assignments.length)return {};
 const attempts=await db.prepare('SELECT assignment_id,activity,word_id,correct,created_at FROM attempts WHERE child_id=? AND assignment_id IN ('+assignments.map(()=>'?').join(',')+')').bind(childId,...assignments.map(a=>a.id)).all<any>();
 return studentHomeworkProgress(assignments,lessons,attempts.results,completed);
}
export async function reactorLeaderboard(db:D1Database,child:{id:string;group_id:string},now:number){
 const week=chinaWeek(now);
 // Each word earns points once per week, across assignments and reactor question formats.
 const rows=await db.prepare("SELECT c.id,c.name,c.group_id,COUNT(DISTINCT t.word_id) AS words FROM children c JOIN attempts t ON t.child_id=c.id WHERE c.approved=1 AND t.correct=1 AND t.created_at>=? AND t.created_at<? AND t.activity IN ('reactor','reactor:build','reactor:spelling','reactor:meaning') GROUP BY c.id,c.name,c.group_id ORDER BY words DESC,c.id").bind(week.start,week.end).all<{id:string;name:string;group_id:string;words:number}>();
 const alias=async(id:string)=>{const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('wordquest-archer:'+id));return 'Archer '+Array.from(new Uint8Array(digest).slice(0,4),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase()};
 async function board(list:typeof rows.results,global:boolean){const entries=await Promise.all(list.map(async(r,i)=>({rank:list.findIndex(x=>Number(x.words)===Number(r.words))+1,name:global?await alias(r.id):r.name,points:Number(r.words)*10,words:Number(r.words),me:r.id===child.id})));return {entries:entries.slice(0,50),you:entries.find(e=>e.me)||null};}
 return {weekStart:new Date(week.start+8*3600000).toISOString().slice(0,10),class:await board(rows.results.filter(r=>r.group_id===child.group_id),false),all:await board(rows.results,true)};
}

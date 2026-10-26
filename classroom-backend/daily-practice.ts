import type {D1Database} from '@cloudflare/workers-types';
import {lessons} from '../github-pages/lessons';
import {publishedSettings} from './lesson-settings';
import {wordAudioChoices} from '../lib/word-audio-choices';
import {shuffle} from '../lib/random';
import {dailyDay,dailyWord,type DailyTask} from '../lib/daily-practice';
import {isSentenceLesson} from '../lib/sentence-lesson';
import {preReaderAge} from '../lib/homework-order';
type Child={id:string;group_id:string};
export async function dailyEnabled(db:D1Database,group:string){return Number((await db.prepare('SELECT enabled FROM daily_practice_groups WHERE group_id=?').bind(group).first<{enabled:number}>())?.enabled)===1}
export async function dailyPractice(db:D1Database,child:Child,now:number){
 const day=dailyDay(now);if(!await dailyEnabled(db,child.group_id))return {enabled:false,day};
 let run=await db.prepare('SELECT * FROM daily_runs WHERE child_id=? AND group_id=? AND day=?').bind(child.id,child.group_id,day).first<{id:string;tasks:string;finished_at:number}>();
 if(!run){
 const assignments=await db.prepare('SELECT * FROM assignments WHERE group_id=? ORDER BY updated_at DESC,id').bind(child.group_id).all<{id:string;unit_id:string;activities:string;word_ids:string}>();
 const reviews=await db.prepare('SELECT word_id,due FROM reviews WHERE child_id=?').bind(child.id).all<{word_id:string;due:number}>();
 const missed=await db.prepare('SELECT word_id FROM attempts WHERE child_id=? AND correct=0 ORDER BY created_at DESC LIMIT 100').bind(child.id).all<{word_id:string}>();
 const settings=await publishedSettings(db,lessons);
 const past=await db.prepare('SELECT r.tasks,a.task_id FROM daily_answers a JOIN daily_runs r ON r.id=a.run_id WHERE r.child_id=? AND a.correct=0 ORDER BY a.created_at DESC LIMIT 100').bind(child.id).all<{tasks:string;task_id:string}>();
 for(const row of past.results){const task=(JSON.parse(row.tasks) as DailyTask[]).find(t=>t.id===row.task_id);if(task)missed.results.push({word_id:task.wordId})}
 const pools:DailyTask[][]=[],seen=new Set<string>();
 for(const a of assignments.results){if(seen.has(a.unit_id))continue;seen.add(a.unit_id);const lesson=lessons.find(l=>l.id===a.unit_id);if(!lesson)continue;
 const ids=JSON.parse(a.word_ids) as string[],activities=JSON.parse(a.activities) as string[],words=lesson.words.filter(w=>ids.includes(w.id!)),pool:DailyTask[]=[];
 const young=preReaderAge(settings[lesson.id]?.age||lesson.defaultAge);
 for(const activity of activities){
 if(young&&!['picture-listen','sound-picture','reactor'].includes(activity))continue;
 if(activity==='story-quiz')for(const q of lesson.readingStory?.questions||[]){pool.push({id:a.id+':'+q.id,assignmentId:a.id,unitId:lesson.id,activity,wordId:q.id,kind:'written',prompt:q.text,image:lesson.readingStory!.scenes.find(s=>s.id===q.scene)?.image,expected:q.options[q.answer],options:shuffle(q.options.map((text,i)=>({id:String(i),text})))});}
 if(!['word-choice','sound-picture','picture-listen','word-sound','sound-word','spell','sentence-build','reactor','match','ward','sprint','lesson','cards'].includes(activity))continue;
 for(const w of words){const others=shuffle(words.filter(x=>x.id!==w.id&&(!isSentenceLesson(lesson.id)||x.category===w.category))).slice(0,3),options=(activity==='word-sound'||activity==='sound-word'?wordAudioChoices(w,words):shuffle([w,...others])).map(dailyWord);if(options.length<4)continue;
 let kind:DailyTask['kind']='written',listen:string|undefined,prompt=w.zh||'Choose the correct answer.',image=w.picture;
 if(activity==='spell'){kind='letters';listen=w.en;prompt='Build the word.'}
 else if(activity==='sentence-build'){kind='sentence';listen=w.en;prompt='Build the sentence.'}
 else if(activity==='sound-picture'||activity==='reactor'&&young){kind='pictures';listen=w.en;image=undefined;prompt='Listen and choose a picture.';if(options.some(o=>!o.image))continue}
 else if(activity==='picture-listen'||activity==='word-sound'){kind='audio-options';prompt=activity==='word-sound'?w.en:'Choose the sound.'}
 else if(activity==='sound-word'){listen=w.en;image=undefined;prompt='Listen and choose.'}
 pool.push({id:a.id+':'+activity+':'+w.id,assignmentId:a.id,unitId:lesson.id,activity,wordId:w.id!,kind,prompt,image,listen,expected:w.en,options});
 }}
 if(pool.length)pools.push(pool);if(pools.length===2)break;
 }
 if(!pools.length)return {enabled:true,day,message:'No review questions yet. Your teacher can assign a lesson with answer exercises. 暂无每日练习题，请等待老师布置。'};
 const score=(t:DailyTask)=>(missed.results.some(r=>r.word_id===t.wordId)?10:0)+(reviews.results.some(r=>r.word_id===t.wordId&&Number(r.due)<=now)?6:0);
 const selected:DailyTask[]=[],used=new Set<string>();
 for(const pool of pools){const ranked=shuffle(pool).sort((a,b)=>score(b)-score(a));let n=0;for(const t of ranked){if(used.has(t.wordId))continue;selected.push(t);used.add(t.wordId);if(++n>=Math.floor(12/pools.length))break}}
 const remaining=shuffle(pools.flat()).sort((a,b)=>score(b)-score(a));for(const t of remaining){if(selected.length>=12)break;if(selected.some(s=>s.id===t.id))continue;selected.push(t);if(selected.length===12)break}
 const originals=selected.slice();while(selected.length<12)selected.push({...originals[selected.length%originals.length],id:originals[selected.length%originals.length].id+':repeat'+selected.length});
 const tasks=shuffle(selected.slice(0,12));const id=crypto.randomUUID();await db.prepare('INSERT OR IGNORE INTO daily_runs VALUES(?,?,?,?,?,?,0)').bind(id,child.id,child.group_id,day,JSON.stringify(tasks),now).run();
 run=await db.prepare('SELECT * FROM daily_runs WHERE child_id=? AND group_id=? AND day=?').bind(child.id,child.group_id,day).first<{id:string;tasks:string;finished_at:number}>();
 }
 const answers=await db.prepare('SELECT DISTINCT task_id FROM daily_answers WHERE run_id=? AND correct=1').bind(run!.id).all<{task_id:string}>();return {enabled:true,day,id:run!.id,tasks:JSON.parse(run!.tasks) as DailyTask[],done:answers.results.map(a=>a.task_id),finished:Number(run!.finished_at)>0};
}
export async function answerDaily(db:D1Database,child:Child,now:number,data:{runId?:unknown;taskId?:unknown;answer?:unknown;eventId?:unknown}){
 if(!await dailyEnabled(db,child.group_id))throw Error('Daily practice is turned off for this class.');
 const run=await db.prepare('SELECT * FROM daily_runs WHERE id=? AND child_id=? AND group_id=? AND day=?').bind(String(data.runId),child.id,child.group_id,dailyDay(now)).first<{id:string;tasks:string;finished_at:number}>();
 if(!run)throw Error('Reopen today’s adventure to continue.');const tasks=JSON.parse(run.tasks) as DailyTask[],task=tasks.find(t=>t.id===data.taskId);if(!task||typeof data.answer!=='string'||data.answer.length>1000||typeof data.eventId!=='string'||! /^[a-zA-Z0-9-]{16,80}$/.test(data.eventId))throw Error('Choose a valid daily answer.');
 const correct=data.answer.trim()===task.expected;
 if(!run.finished_at){const statements=[db.prepare('INSERT OR IGNORE INTO daily_answers VALUES(?,?,?,?,?,?)').bind(data.eventId,run.id,task.id,Number(correct),now,data.answer)];
 const word=lessons.find(l=>l.id===task.unitId)?.words.find(w=>w.id===task.wordId);
 if(word)statements.push(db.prepare(`INSERT INTO reviews(child_id,word_id,step,due) SELECT ?,?,?,? WHERE changes()=1 ON CONFLICT(child_id,word_id) DO UPDATE SET step=CASE WHEN ?=0 THEN 0 WHEN reviews.due>? THEN reviews.step ELSE MIN(reviews.step+1,4) END,due=CASE WHEN ?=0 THEN ? WHEN reviews.due>? THEN reviews.due ELSE ?+CASE MIN(reviews.step+1,4) WHEN 1 THEN 86400000 WHEN 2 THEN 259200000 WHEN 3 THEN 604800000 ELSE 1209600000 END END`).bind(child.id,word.id,correct?1:0,now+(correct?86400000:600000),Number(correct),now,Number(correct),now+600000,now,now));
 statements.push(db.prepare('UPDATE daily_runs SET finished_at=? WHERE id=? AND finished_at=0 AND (SELECT COUNT(DISTINCT task_id) FROM daily_answers WHERE run_id=? AND correct=1)>=?').bind(now,run.id,run.id,tasks.length));
 statements.push(db.prepare(`INSERT OR IGNORE INTO reward_events(id,child_id,source,kind,label,xp,created_at,revoked) SELECT ?,?,?,?,?,?,?,0 WHERE EXISTS(SELECT 1 FROM daily_runs WHERE id=? AND finished_at>0)`).bind(crypto.randomUUID(),child.id,'daily:'+dailyDay(now),'daily','Daily adventure finished',10,now,run.id));await db.batch(statements);}
 return {...await dailyPractice(db,child,now),correct};
}
export async function dailyReport(db:D1Database,group:string,now:number){
 const children=await db.prepare('SELECT id,name FROM children WHERE group_id=? AND approved=1 ORDER BY name').bind(group).all<{id:string;name:string}>();const rows=[];
 for(const child of children.results){const run=await db.prepare('SELECT id,tasks,finished_at FROM daily_runs WHERE child_id=? AND group_id=? AND day=?').bind(child.id,group,dailyDay(now)).first<{id:string;tasks:string;finished_at:number}>();const tasks=run?JSON.parse(run.tasks) as DailyTask[]:[],answers=run?(await db.prepare('SELECT task_id,correct,answer FROM daily_answers WHERE run_id=? ORDER BY created_at').bind(run.id).all<{task_id:string;correct:number;answer:string}>()).results:[];rows.push({name:child.name,total:tasks.length||12,done:new Set(answers.filter(a=>Number(a.correct)===1).map(a=>a.task_id)).size,finished:Boolean(run?.finished_at),mistakes:tasks.filter(t=>answers.some(a=>a.task_id===t.id&&!Number(a.correct))).map(t=>({activity:t.activity,prompt:t.prompt,expected:t.expected,answers:answers.filter(a=>a.task_id===t.id&&!Number(a.correct)).map(a=>a.answer)}))})}
 return {day:dailyDay(now),enabled:await dailyEnabled(db,group),students:rows};
}

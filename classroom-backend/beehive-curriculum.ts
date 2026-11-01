import type {D1Database} from '@cloudflare/workers-types';
import {beehiveActivities,beehiveActivityAllowed,beehiveLessonNumber} from '../lib/beehive-activities';
import {lessons} from '../github-pages/lessons';
// One-time, idempotent curriculum maintenance. Keep attempts, dates and completed work.
export async function updateBeehiveAssignments(db:D1Database){
 const key='curriculum:beehive-u4-missions-v2';if(await db.prepare('SELECT value FROM config WHERE key=?').bind(key).first())return;
 const rows=await db.prepare("SELECT id,unit_id,activities FROM assignments WHERE unit_id LIKE 'beehive1-u4-lesson%'").all<{id:string;unit_id:string;activities:string}>();
 const statements=[];
 for(const row of rows.results){const lesson=lessons.find(l=>l.id===row.unit_id);if(!lesson)continue;const next=JSON.stringify(beehiveActivities(row.unit_id,JSON.parse(row.activities),lesson.defaultActivities||[]));if(next!==row.activities)statements.push(db.prepare('UPDATE assignments SET activities=? WHERE id=? AND activities=?').bind(next,row.id,row.activities))}
 // Retain answers from superseded daily sessions, while freeing today's slot for fresh tasks.
 const day=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 const runs=await db.prepare('SELECT id,day,tasks FROM daily_runs WHERE day=?').bind(day).all<{id:string;day:string;tasks:string}>();
 for(const run of runs.results){const retired=(JSON.parse(run.tasks) as {unitId:string;activity:string;wordId:string}[]).some(task=>{if(!beehiveLessonNumber(task.unitId))return false;if(!beehiveActivityAllowed(task.unitId,task.activity))return true;const lesson=lessons.find(l=>l.id===task.unitId);return task.activity==='story-quiz'&&!lesson?.readingStory?.questions.some(q=>q.id===task.wordId)});if(retired)statements.push(db.prepare('UPDATE daily_runs SET day=? WHERE id=? AND day=?').bind(run.day+':beehive-archive:'+run.id,run.id,run.day))}
 statements.push(db.prepare('INSERT OR IGNORE INTO config(key,value) VALUES(?,?)').bind(key,'ready'));
 await db.batch(statements);
}

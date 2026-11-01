import type {D1Database} from '@cloudflare/workers-types';
import {beehiveActivities} from '../lib/beehive-activities';
import {lessons} from '../github-pages/lessons';
// One-time, idempotent curriculum maintenance. Keep attempts, dates and completed work.
export async function updateBeehiveAssignments(db:D1Database){
 const key='curriculum:beehive-u4-missions-v1';if(await db.prepare('SELECT value FROM config WHERE key=?').bind(key).first())return;
 const rows=await db.prepare("SELECT id,unit_id,activities FROM assignments WHERE unit_id LIKE 'beehive1-u4-lesson%'").all<{id:string;unit_id:string;activities:string}>();
 const statements=[];
 for(const row of rows.results){const lesson=lessons.find(l=>l.id===row.unit_id);if(!lesson)continue;const next=JSON.stringify(beehiveActivities(row.unit_id,JSON.parse(row.activities),lesson.defaultActivities||[]));if(next!==row.activities)statements.push(db.prepare('UPDATE assignments SET activities=? WHERE id=? AND activities=?').bind(next,row.id,row.activities))}
 statements.push(db.prepare('INSERT OR IGNORE INTO config(key,value) VALUES(?,?)').bind(key,'ready'));
 await db.batch(statements);
}

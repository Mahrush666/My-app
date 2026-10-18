import type {D1Database} from '@cloudflare/workers-types';
import {requiresAnswers} from '../lib/homework-completion';
import {homeworkXP,rewardSummary,type RewardEntry} from '../lib/rewards';
export async function readRewards(db:D1Database,childId:string){const rows=await db.prepare('SELECT id,kind,source,label,xp,created_at,revoked FROM reward_events WHERE child_id=? ORDER BY created_at DESC,id').bind(childId).all<RewardEntry>();return rewardSummary(rows.results);}
// The unique child/source pair makes rescans, retries and concurrent requests safe.
// Assignment edits and deletion never erase previously earned points.
export async function syncHomeworkRewards(db:D1Database,childId:string,assignments:{id:string;activities:string;title?:string;updated_at?:number}[],now:number){
 const statements=assignments.flatMap(a=>{const required=(JSON.parse(a.activities) as string[]).filter(requiresAnswers);if(!required.length)return [];
 return [db.prepare(`INSERT OR IGNORE INTO reward_events(id,child_id,source,kind,label,xp,created_at,revoked) SELECT ?,?,?,?,?,?,?,0 WHERE EXISTS(SELECT 1 FROM assignments WHERE id=? AND updated_at=?) AND (SELECT COUNT(DISTINCT activity) FROM completions WHERE child_id=? AND assignment_id=? AND activity IN (${required.map(()=>'?').join(',')}))=?`).bind(crypto.randomUUID(),childId,'homework:'+a.id,'homework',a.title||'Homework finished',homeworkXP,now,a.id,a.updated_at,childId,a.id,...required,required.length)];});
 for(let i=0;i<statements.length;i+=50)await db.batch(statements.slice(i,i+50));
}

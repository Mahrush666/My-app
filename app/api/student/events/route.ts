import { z } from 'zod';
import { student } from '@/lib/auth';
import { db, json, sameOrigin } from '@/lib/db';
const eventSchema=z.object({id:z.string().uuid(),kind:z.enum(['review','game_answer','practice_answer','reading','lesson_session']),unitId:z.string().max(80),wordId:z.string().max(80).optional(),correct:z.boolean().optional(),occurredAt:z.number().int().positive(),detail:z.record(z.union([z.string().max(300),z.number().finite(),z.boolean()])).default({})});
export async function POST(request:Request){if(!sameOrigin(request))return json({error:'Please use this app.'},403);try{const s=await student(request);if(!s)return json({error:'Your session ended. Enter your student code again.'},401);const parsed=z.array(eventSchema).min(1).max(30).safeParse(await request.json());if(!parsed.success)return json({error:'Invalid activity.'},400);const database=db();const acknowledged:string[]=[];
 for(const event of parsed.data){const assigned=await database.prepare('SELECT u.id FROM units u JOIN class_units cu ON cu.unit_id=u.id WHERE u.id=? AND cu.class_id=? AND u.published=1').bind(event.unitId,s.class_id).first();if(!assigned)return json({error:'This lesson is no longer assigned. Ask your teacher.'},403);
 const answerEvent=['review','game_answer','practice_answer'].includes(event.kind);
 if(answerEvent&&(!event.wordId||typeof event.correct!=='boolean'||!await database.prepare('SELECT word_id FROM unit_words WHERE unit_id=? AND word_id=?').bind(event.unitId,event.wordId).first()))return json({error:'This word is not in your lesson.'},400);
 if(event.kind==='lesson_session'&&(typeof event.detail.durationSeconds!=='number'||!Number.isInteger(event.detail.durationSeconds)||event.detail.durationSeconds<0||event.detail.durationSeconds>1800||typeof event.detail.completed!=='boolean'||typeof event.detail.answers!=='number'||!Number.isInteger(event.detail.answers)||event.detail.answers<0||event.detail.answers>1000||typeof event.detail.firstTry!=='number'||!Number.isInteger(event.detail.firstTry)||event.detail.firstTry<0||event.detail.firstTry>event.detail.answers))return json({error:'Invalid lesson session.'},400);
 const now=Date.now();const statements=[database.prepare('INSERT INTO events(id,student_id,unit_id,word_id,kind,correct,detail,created_at,occurred_at,processed) VALUES(?,?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO NOTHING').bind(event.id,s.id,event.unitId,event.wordId||null,event.kind,event.correct===undefined?null:Number(event.correct),JSON.stringify(event.detail),now,Math.min(now,event.occurredAt))];
 if(answerEvent){
 // Compute schedule atomically against current server progress; retries do not advance it twice.
 statements.push(database.prepare(`INSERT INTO reviews(student_id,word_id,step,due,reviewed_at,count,correct)
 SELECT ?,?, ?,?, ?,1,? WHERE EXISTS(SELECT 1 FROM events WHERE id=? AND student_id=? AND processed=0)
 ON CONFLICT(student_id,word_id) DO UPDATE SET
 step=CASE WHEN ?=0 THEN 0 WHEN reviews.due>? THEN reviews.step ELSE MIN(reviews.step+1,4) END,
 due=CASE WHEN ?=0 THEN ?+600000 WHEN reviews.due>? THEN reviews.due ELSE ?+CASE WHEN reviews.step=0 THEN 86400000 WHEN reviews.step=1 THEN 259200000 WHEN reviews.step=2 THEN 604800000 ELSE 1209600000 END END,
 reviewed_at=?,count=reviews.count+1,correct=reviews.correct+excluded.correct`).bind(s.id,event.wordId, event.correct?1:0,now+(event.correct?86400000:600000),now,Number(event.correct),event.id,s.id,Number(event.correct),now,Number(event.correct),now,now,now,now));
 }
 statements.push(database.prepare('UPDATE students SET last_seen=? WHERE id=? AND EXISTS(SELECT 1 FROM events WHERE id=? AND student_id=? AND processed=0)').bind(now,s.id,event.id,s.id),database.prepare('UPDATE events SET processed=1 WHERE id=? AND student_id=?').bind(event.id,s.id));await database.batch(statements);acknowledged.push(event.id);
 }return json({acknowledged,syncedAt:Date.now()});
 }catch(e){console.error('Activity save failed',e instanceof Error?e.message:'Storage failure');return json({error:'Activity is not saved online yet. We will retry.'},503)}}

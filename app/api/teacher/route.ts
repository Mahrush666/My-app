import { teacher } from '@/lib/auth';
import { db, hash, json, randomCode, sameOrigin } from '@/lib/db';
import { lessonInput, normalizeWord } from '@/lib/lesson';
import { words as starterWords } from '@/app/words';
import { passages } from '@/app/passages';
export const dynamic='force-dynamic';
export async function GET(request:Request){if(!await teacher())return json({error:'Teacher access required.'},403);try{
 const database=db();const params=new URL(request.url).searchParams;const studentId=params.get('student');const period=params.get('period');const since=period==='all'?0:Date.now()-(period==='month'?30:7)*86400000;
 if(studentId){const s=await database.prepare('SELECT s.id,s.name,s.class_id,c.name AS class_name,s.last_seen FROM students s JOIN classes c ON c.id=s.class_id WHERE s.id=?').bind(studentId).first();if(!s)return json({error:'Student not found.'},404);
 const history=await database.prepare('SELECT e.kind,e.correct,e.created_at,e.occurred_at,e.detail,w.en,u.title AS unit FROM events e LEFT JOIN words w ON w.id=e.word_id LEFT JOIN units u ON u.id=e.unit_id WHERE e.student_id=? AND e.created_at>=? ORDER BY e.created_at DESC LIMIT 100').bind(studentId,since).all();
 const reviews=await database.prepare('SELECT w.en,w.zh,r.step,r.due,r.count,r.correct FROM reviews r JOIN words w ON w.id=r.word_id WHERE r.student_id=? ORDER BY r.correct*1.0/r.count ASC,r.due ASC LIMIT 200').bind(studentId).all();const lessons=await database.prepare(`SELECT u.title,b.title AS book_title,COUNT(uw.word_id) AS total,SUM(CASE WHEN r.word_id IS NOT NULL THEN 1 ELSE 0 END) AS practiced FROM students s JOIN class_units cu ON cu.class_id=s.class_id JOIN units u ON u.id=cu.unit_id JOIN books b ON b.id=u.book_id JOIN unit_words uw ON uw.unit_id=u.id LEFT JOIN reviews r ON r.student_id=s.id AND r.word_id=uw.word_id WHERE s.id=? AND u.published=1 GROUP BY u.id`).bind(studentId).all();return json({student:s,history:history.results,reviews:reviews.results,lessons:lessons.results})}
 const classes=await database.prepare('SELECT * FROM classes ORDER BY created_at').all();
 const students=await database.prepare(`SELECT s.id,s.name,s.class_id,s.last_seen,
 (SELECT COUNT(*) FROM reviews r WHERE r.student_id=s.id) AS practiced,
 (SELECT COUNT(*) FROM reviews r WHERE r.student_id=s.id AND r.due<=?) AS due,
 (SELECT COUNT(*) FROM events e WHERE e.student_id=s.id AND e.kind='review' AND e.created_at>?) AS weekly_reviews,
 (SELECT COUNT(*) FROM events e WHERE e.student_id=s.id AND e.kind='game_answer') AS game_answers,
 (SELECT COUNT(*) FROM events e WHERE e.student_id=s.id AND e.kind='game_answer' AND e.correct=1) AS game_correct,
 (SELECT COUNT(*) FROM events e WHERE e.student_id=s.id AND e.kind='reading') AS readings,
 (SELECT COUNT(*) FROM events e WHERE e.student_id=s.id AND e.kind='practice_answer' AND e.created_at>=${since}) AS exercise_answers,
 (SELECT COUNT(*) FROM events e WHERE e.student_id=s.id AND e.kind='practice_answer' AND e.correct=1 AND e.created_at>=${since}) AS exercise_correct,
 (SELECT COALESCE(SUM(CAST(json_extract(e.detail,'$.durationSeconds') AS INTEGER)),0) FROM events e WHERE e.student_id=s.id AND e.kind='lesson_session' AND e.created_at>=${since}) AS study_seconds,
 (SELECT COUNT(*) FROM events e WHERE e.student_id=s.id AND e.kind='lesson_session' AND json_extract(e.detail,'$.completed')=1 AND e.created_at>=${since}) AS lessons_completed
 FROM students s ORDER BY s.name`).bind(Date.now(),Date.now()-7*86400000).all();
 const units=await database.prepare('SELECT u.*,b.title AS book_title FROM units u JOIN books b ON b.id=u.book_id ORDER BY b.title,u.title').all();
 const words=await database.prepare('SELECT uw.unit_id,w.id,w.en,w.zh,w.icon,uw.sentence,uw.position FROM unit_words uw JOIN words w ON w.id=uw.word_id ORDER BY uw.position').all();
 const assignments=await database.prepare('SELECT * FROM class_units').all();return json({classes:classes.results,students:students.results,units:units.results.map(u=>({...u,readings:JSON.parse(String(u.readings)),words:words.results.filter(w=>w.unit_id===u.id)})),assignments:assignments.results});
 }catch(e){console.error('Teacher load failed',e instanceof Error?e.message:'Storage failure');return json({error:'Could not load your classroom. Please try again.'},503)}}
export async function POST(request:Request){if(!await teacher())return json({error:'Teacher access required.'},403);if(!sameOrigin(request))return json({error:'Please use the teacher page.'},403);if(Number(request.headers.get('content-length'))>1_000_000)return json({error:'Please use a smaller lesson file.'},413);try{
 const data=await request.json() as Record<string,unknown>;const database=db();
 if(data.action==='class'){const name=String(data.name||'').trim();if(!name||name.length>80)return json({error:'Enter a class name of up to 80 characters.'},400);const id=crypto.randomUUID();await database.prepare('INSERT INTO classes(id,name,created_at) VALUES(?,?,?)').bind(id,name,Date.now()).run();return json({id})}
 if(data.action==='students'){
 const classId=String(data.classId||'');if(!await database.prepare('SELECT id FROM classes WHERE id=?').bind(classId).first())return json({error:'Choose a class.'},400);
 if(!Array.isArray(data.names)||!data.names.length||data.names.length>100)return json({error:'Add between 1 and 100 student names.'},400);
 const names=data.names.map(n=>String(n).trim());if(names.some(n=>!n||n.length>60)||new Set(names).size!==names.length)return json({error:'Use unique names or nicknames, up to 60 characters each.'},400);
 const created=await Promise.all(names.map(async name=>{const code=randomCode();return {id:crypto.randomUUID(),name,code,hash:await hash(code)}}));
 await database.batch(created.map(s=>database.prepare('INSERT INTO students(id,class_id,name,code_hash,created_at) VALUES(?,?,?,?,?)').bind(s.id,classId,s.name,s.hash,Date.now())));return json({students:created.map(({id,name,code})=>({id,name,code}))});
 }
 if(data.action==='rotate'){
 const id=String(data.studentId||'');const s=await database.prepare('SELECT id,name FROM students WHERE id=?').bind(id).first();if(!s)return json({error:'Student not found.'},404);const code=randomCode();await database.batch([database.prepare('UPDATE students SET code_hash=? WHERE id=?').bind(await hash(code),id),database.prepare('DELETE FROM student_sessions WHERE student_id=?').bind(id)]);return json({students:[{id,name:s.name,code}]});
 }
 if(data.action==='assign'){
 const classId=String(data.classId||'');if(!await database.prepare('SELECT id FROM classes WHERE id=?').bind(classId).first())return json({error:'Choose a class.'},400);
 if(!Array.isArray(data.unitIds)||data.unitIds.length>500)return json({error:'Choose the units for this class.'},400);const ids=[...new Set(data.unitIds.map(String))];for(const id of ids)if(!await database.prepare('SELECT id FROM units WHERE id=?').bind(id).first())return json({error:'A unit could not be found.'},400);
 await database.batch([database.prepare('DELETE FROM class_units WHERE class_id=?').bind(classId),...ids.map(id=>database.prepare('INSERT INTO class_units(class_id,unit_id) VALUES(?,?)').bind(classId,id))]);return json({saved:true});
 }
 if(data.action==='lesson'||data.action==='seed'){
 if(data.action==='seed'&&await database.prepare('SELECT id FROM units LIMIT 1').first())return json({error:'Example lessons are available only before you add your own units.'},400);
 const lesson=data.action==='seed'?{bookTitle:'WordQuest Starter',title:'Unit 1 · My first words',published:true,words:starterWords,readings:passages}:data;
 const parsed=lessonInput.safeParse(lesson);if(!parsed.success)return json({error:parsed.error.issues.map(x=>x.message).join(' ')},400);const input=parsed.data;
 const existingBook=await database.prepare('SELECT id FROM books WHERE title=?').bind(input.bookTitle).first<{id:string}>();const bookId=existingBook?.id||crypto.randomUUID();const id=input.id||crypto.randomUUID();if(input.id&&!await database.prepare('SELECT id FROM units WHERE id=?').bind(id).first())return json({error:'Unit not found.'},404);
 const readings=input.readings.map((r,index)=>({...r,id:`${id}:${index}`}));const statements=[database.prepare('INSERT INTO books(id,title) VALUES(?,?) ON CONFLICT(id) DO NOTHING').bind(bookId,input.bookTitle),database.prepare('INSERT INTO units(id,book_id,title,readings,published,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET book_id=excluded.book_id,title=excluded.title,readings=excluded.readings,published=excluded.published,updated_at=excluded.updated_at').bind(id,bookId,input.title,JSON.stringify(readings),Number(input.published),Date.now()),database.prepare('DELETE FROM unit_words WHERE unit_id=?').bind(id)];
 const all=await Promise.all(input.words.map(async(w,i)=>({...w,wordId:await hash(normalizeWord(w.en,w.zh)),position:i})));
 for(const w of all){statements.push(database.prepare('INSERT INTO words(id,en,zh,icon,sentence,category) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET icon=excluded.icon').bind(w.wordId,w.en,w.zh,w.icon,w.sentence,'Lesson 单元'),database.prepare('INSERT INTO unit_words(unit_id,word_id,sentence,position) VALUES(?,?,?,?)').bind(id,w.wordId,w.sentence,w.position))}
 // D1 batch is atomic; a lesson never becomes half-published.
 await database.batch(statements);return json({id});
 }
 return json({error:'Unknown action.'},400);
 }catch(e){console.error('Teacher save failed',e instanceof Error?e.message:'Storage failure');return json({error:'Could not save. Your input is still here; please try again.'},503)}}

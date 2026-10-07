import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { nextReview, lessonWords } from '../lib/review-schedule.ts';

const database = new DatabaseSync(':memory:');
database.exec(readFileSync(new URL('../drizzle/0000_broad_mephisto.sql', import.meta.url), 'utf8'));
database.exec("INSERT INTO classes VALUES('c','Test class',0); INSERT INTO students(id,class_id,name,code_hash,created_at) VALUES('s','c','Test student','test-only',0); INSERT INTO words(id,en,zh) VALUES('w','cat','猫');");
const route = readFileSync(new URL('../app/api/student/events/route.ts', import.meta.url), 'utf8');
const sql = route.match(/prepare\(`(INSERT INTO reviews[\s\S]*?)`\)/)?.[1];
assert.ok(sql, 'The server review update must be present');
let client;
function record(id, correct, now, retry = false) {
  database.prepare("INSERT INTO events(id,student_id,word_id,kind,correct,created_at,occurred_at,processed) VALUES(?,'s','w','practice_answer',?,?,?,0) ON CONFLICT(id) DO NOTHING").run(id, Number(correct), now, now);
  database.prepare(sql).run('s','w',Number(correct),now+(correct?86400000:600000),now,Number(correct),id,'s',Number(correct),now,Number(correct),now,now,now,now);
  database.prepare('UPDATE events SET processed=1 WHERE id=?').run(id);
  if (!retry) client = nextReview(client, correct, now);
  const server = database.prepare('SELECT step,due,count,correct FROM reviews').get();
  assert.deepEqual({ step: server.step, due: server.due }, client, 'Browser and server schedules must agree');
  return server;
}
assert.equal(record('a',true,1000).step,1);
assert.equal(record('b',true,2000).step,1,'Repeated successful practice must not inflate the interval');
assert.equal(record('c',false,3000).step,0);
assert.equal(record('d',true,4000).due,603000,'An immediate correction must not erase a mistake');
assert.equal(record('d',true,5000,true).count,4,'A retry must not be counted twice');
assert.equal(record('e',true,604000).step,1);
const vocabulary = Array.from({length:8}, (_,i)=>({id:String(i),en:String(i),zh:String(i),icon:'',category:'',sentence:''}));
const progress = Object.fromEntries(vocabulary.slice(0,7).map(w=>[w.id,{step:0,due:900000}]));
const chosen = lessonWords(vocabulary,progress,1000,6);
assert.equal(chosen.length,6); assert.ok(chosen.some(w=>w.id==='7'),'Make room for a new word alongside mistakes');
assert.ok(chosen.some(w=>w.id==='0'),'Mistakes should remain a priority');
database.close();
console.log('Learning checks passed: browser/server agreement, mistake recovery, retry safety, interval protection, and adaptive word selection.');

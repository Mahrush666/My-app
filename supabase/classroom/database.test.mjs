import {test} from 'node:test';import assert from 'node:assert/strict';import {localDatabase} from './test-adapter.mjs';
test('RPC keeps batches atomic, preserves quoted input and denies anonymous database access',async()=>{
 const db=await localDatabase();try{
 const title="Who's jumping?'); DROP TABLE groups;--";
 await db.prepare('INSERT INTO groups VALUES(?,?,?,?)').bind('safe',title,'safe-hash',1791900000000).run();
 assert.equal((await db.prepare('SELECT name FROM groups WHERE id=?').bind('safe').first()).name,title);
 await assert.rejects(()=>db.batch([db.prepare('INSERT INTO groups VALUES(?,?,?,?)').bind('rolled-back','Test','hash2',1791900000000),db.prepare('INSERT INTO groups VALUES(?,?,?,?)').bind('safe','Duplicate','hash3',1791900000000)]));
 assert.equal(await db.prepare('SELECT id FROM groups WHERE id=?').bind('rolled-back').first(),null);
 for(const role of ['anon','authenticated']){await db.pg.exec('SET ROLE '+role);await assert.rejects(()=>db.pg.query("SELECT public.wordquest_batch('[]'::jsonb)"));await assert.rejects(()=>db.pg.query('SELECT * FROM wordquest.children'));await assert.rejects(()=>db.pg.query('SELECT * FROM wordquest.reward_events'));await assert.rejects(()=>db.pg.query('SELECT * FROM wordquest.staff_accounts'));for(const table of ['campuses','group_campuses','staff_campuses'])await assert.rejects(()=>db.pg.query('SELECT * FROM wordquest.'+table));await db.pg.exec('RESET ROLE');}
 await db.pg.exec('SET ROLE service_role');assert.equal((await db.prepare('SELECT name FROM groups WHERE id=?').bind('safe').first()).name,title);
 }finally{await db.pg.close();}
});

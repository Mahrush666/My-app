import assert from 'node:assert/strict';import{build}from'esbuild';
const r=await build({entryPoints:['lib/homework-time.ts'],bundle:true,format:'esm',platform:'node',write:false});const{ActiveHomeworkClock:Clock,homeworkTime:total,formatHomeworkTime:format}=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));
const c=new Clock(0),rows=[];const save=(t,id)=>rows.push(...c.flush(t).map(x=>({session_id:id,started_at:x.start,ended_at:x.end})));
c.activity(10000);save(20000,'first');c.setForeground(false,25000);save(86425000,'first');c.setForeground(true,86425000);save(86435000,'second');assert.deepEqual(total(rows),{activeSeconds:35,sessions:2});
const idle=new Clock(0);assert.deepEqual(idle.flush(120000),[{start:0,end:60000}]);idle.activity(130000);assert.deepEqual(idle.flush(135000),[{start:130000,end:135000}]);
assert.deepEqual(total([{session_id:'a',started_at:1000,ended_at:11000},{session_id:'b',started_at:5000,ended_at:15000}]),{activeSeconds:14,sessions:2});assert.equal(total([]),null);assert.equal(format(3661),'1h 1m 1s');
console.log('PASS: day-long gaps and background time excluded, idle cutoff, returning activity, overlap deduplication and display.');

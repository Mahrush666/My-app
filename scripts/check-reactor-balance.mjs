import assert from 'node:assert/strict';
import {build} from 'esbuild';
const result=await build({entryPoints:['lib/reactor-balance.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {reactorArrowInterval:interval,reactorEnemyKind:kind,reactorEnemyStats:stats}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const previous=0.5/0.9;
assert.ok(Math.abs((1/interval(1))/(1/previous)-0.8)<1e-10,'Starting rate is 20% slower');
assert.ok(interval(1)>interval(2)&&interval(2)>interval(3)&&interval(3)>interval(4));
assert.equal(interval(4),previous);assert.equal(interval(100),previous);
for(let id=0;id<100;id++)assert.equal(kind(24.99,id),'hopper');
assert.equal(Array.from({length:20},(_,id)=>kind(30,id)).filter(k=>k==='armored').length,4);
for(const time of [25,40,80,119]){
 const h=stats('hopper',time),a=stats('armored',time);
 assert.ok(a.speed<h.speed&&a.hp>h.hp&&a.score>h.score);
 assert.ok(a.shotRadius>h.shotRadius&&a.contactRadius>h.contactRadius);
 assert.ok(Math.ceil(a.hp/2)>Math.ceil(h.hp/2),'Guard takes more swift-archer hits');
 assert.equal(stats('boss',time).hp,32);
}
console.log('PASS: 20% slower initial rate, gradual recovery, delayed guard spawns, durable/slower guards, collision sizes and boss health.');

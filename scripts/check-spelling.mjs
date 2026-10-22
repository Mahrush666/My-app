import assert from 'node:assert/strict';
import {build} from 'esbuild';
import fs from 'node:fs';
fs.mkdirSync('.wrangler/spelling-test',{recursive:true});
await build({entryPoints:['lib/spelling-steps.ts'],bundle:true,platform:'node',format:'esm',outfile:'.wrangler/spelling-test/model.mjs'});
const {spellingOrder,spellingGaps,spellingTiles}=await import('../.wrangler/spelling-test/model.mjs');
for(const word of ['swim','play football','a heart','you are very nice to me','go','television']){
 const order=spellingOrder(word);let prior=0;
 for(let stage=0;stage<5;stage++){
  const gaps=spellingGaps(word,stage,order),tiles=spellingTiles(word,gaps);
  assert.equal(tiles.length,gaps.length);assert.equal(new Set(tiles.map(t=>t.id)).size,tiles.length);
  assert.deepEqual(tiles.map(t=>t.letter).sort(),gaps.map(i=>word[i]).sort());
  assert.ok(gaps.every(i=>/[a-z]/i.test(word[i])));
  if(stage===0||stage===4)assert.equal(gaps.length,order.length);
  if(stage===1)assert.equal(gaps.length,Math.min(2,order.length));
  if(stage>1)assert.ok(gaps.length>=prior);
  prior=gaps.length;
 }
}
console.log('PASS: five spelling stages, repeated letters, short words, phrases, punctuation, progressively hidden letters.');

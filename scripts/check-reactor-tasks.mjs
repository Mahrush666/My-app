import assert from 'node:assert/strict';import fs from 'node:fs';import {build} from 'esbuild';
fs.mkdirSync('.wrangler/reactor-test',{recursive:true});
await build({entryPoints:['lib/reactor-tasks.ts'],bundle:true,platform:'node',format:'esm',outfile:'.wrangler/reactor-test/model.mjs'});
const {spellingChoices,reactorTaskTypes}=await import('../.wrangler/reactor-test/model.mjs');
assert.deepEqual([...reactorTaskTypes].sort(),['build','meaning','spelling']);
for(const word of ['boots','dress','T-shirt','play football','a','swim'])for(let i=0;i<100;i++){
 const choices=spellingChoices(word);assert.equal(choices.length,4);assert.equal(new Set(choices).size,4);assert.equal(choices.filter(c=>c===word).length,1);
}
console.log('PASS: spelling questions have four unique choices with exactly one correct spelling.');

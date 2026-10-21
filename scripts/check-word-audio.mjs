import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
fs.mkdirSync('.wrangler/word-audio-test',{recursive:true});
await build({stdin:{contents:`export {wordAudioChoices} from './lib/word-audio-choices';export {audioKey,audioSource} from './lib/audio';export {smartPhonics2Unit2 as lesson} from './github-pages/smart-phonics2-u2';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'.wrangler/word-audio-test/index.mjs'});
const {wordAudioChoices,audioKey,audioSource,lesson}=await import('../.wrangler/word-audio-test/index.mjs');
const duplicated=[...lesson.words,{...lesson.words[0],id:'duplicate-can',en:' CAN '}];
for(const word of lesson.words)for(let round=0;round<100;round++){
 const options=wordAudioChoices(word,duplicated);
 assert.equal(options.length,4);
 assert.equal(options.filter(w=>audioKey(w.en)===audioKey(word.en)).length,1);
 assert.equal(new Set(options.map(w=>audioSource(w.en))).size,4);
}
console.log('PASS: 800 Unit 2 questions have four distinct sounds and exactly one correct option, including duplicate vocabulary.');

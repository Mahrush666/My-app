import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
fs.mkdirSync('.wrangler/word-audio-test',{recursive:true});
await build({stdin:{contents:`export {wordAudioChoices,similarReadingWords} from './lib/word-audio-choices';export {audioKey,audioSource} from './lib/audio';export {smartPhonics2Unit1 as unit1} from './github-pages/smart-phonics2-u1';export {smartPhonics2Unit2 as unit2} from './github-pages/smart-phonics2-u2';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'.wrangler/word-audio-test/index.mjs'});
const {wordAudioChoices,similarReadingWords,audioKey,audioSource,unit1,unit2}=await import('../.wrangler/word-audio-test/index.mjs');
for(const lesson of [unit1,unit2]){
const duplicated=[...lesson.words,{...lesson.words[0],id:'duplicate-can',en:' '+lesson.words[0].en.toUpperCase()+' '}];
for(const word of lesson.words)for(let round=0;round<100;round++){
 const options=wordAudioChoices(word,duplicated);
 assert.equal(options.length,4);
 for(let i=0;i<options.length;i++)for(let j=i+1;j<options.length;j++)assert.equal(similarReadingWords(options[i].en,options[j].en),false);
 assert.equal(options.filter(w=>audioKey(w.en)===audioKey(word.en)).length,1);
 assert.equal(new Set(options.map(w=>audioSource(w.en))).size,4);
}
}
assert.equal(similarReadingWords('can','cat'),true);
assert.equal(similarReadingWords('can','fan'),true);
assert.equal(similarReadingWords('can','hat'),false);
console.log('PASS: 1600 Unit 1/2 questions contain four distinct choices, no minimal pairs and exactly one correct option.');

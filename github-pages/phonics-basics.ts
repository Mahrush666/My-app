import type {Lesson} from './lessons';

// These are vowel–consonant blends, not grammatical words or letter names.
// In particular, as /æs/ and is /ɪs/ retain the unvoiced /s/ for blending.
const groups=[
 {vowel:'a',sound:'æ',pairs:['am','an','ap','at','as']},
 {vowel:'e',sound:'ɛ',pairs:['ed','en','es']},
 {vowel:'i',sound:'ɪ',pairs:['ib','id','ig','is']},
];
export const phonicsBasicsPairs:Lesson={
 id:'phonics-basics-pairs',book:'Phonics basics',
 title:'Unit 1 · Lesson 1 · Short vowel pairs',
 unit:{id:'phonics-basics-unit1',number:1,title:'Unit 1 · Blending sounds'},
 lessonTitle:'Lesson 1 · Letter pairs · a, e, i',defaultAge:'6–12',
 defaultActivities:['sound-word','word-sound','spell'],
 allowedActivities:['sound-word','word-sound','spell'],
 words:groups.flatMap(group=>group.pairs.map(en=>({
  id:'phonics-basics-'+en,en,zh:'短元音 '+group.vowel+' · 两个字母拼读',icon:'',
  category:'Short '+group.vowel+' /'+group.sound+'/',sentence:en,
  spellingParts:[...en],recording:'lesson-audio/phonics-basics/'+en+'.mp3',
 }))),readings:[],
};

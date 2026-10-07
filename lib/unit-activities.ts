export const activityOptions = [
 ['picture-speak','🎤','Flashcards · Picture → say the word','Ages 3–5. Speaking cards with spaced repetition.'],
 ['picture-listen','🔊','Flashcards · Picture → choose the sound','Ages 3–5. Listening cards with spaced repetition.'],
 ['lesson','✨','Guided lesson','Listening, spelling, sentences and reading.'],
 ['cards','📚','Flashcards · Read & recall','Ages 6–12. Read the word and review with spaced repetition.'],
 ['word-choice','🔤','Flashcards · Choose the written word','Ages 6–12. Match a picture or sound to a written word.'],
 ['reading','📖','Read aloud','Read paragraphs and record your voice.'],
 ['reactor','🏹','Word Reactor','Action game with written word questions.'],
 ['match','🧩','Word Match','Match English and Chinese words.'],
 ['spell','🔤','Letter Builder','Spell the English word.'],
 ['ward','🛡️','Word Guardians','Action game with written questions.'],
 ['sprint','⭐','Star Sprint','Action game with written questions.'],
] as const;
export type ActivityId = typeof activityOptions[number][0];
export type UnitSettings = { activities: ActivityId[]; age: string };
export type Settings = Record<string,UnitSettings>;
export const allActivities: ActivityId[] = activityOptions.map(a=>a[0]);
export const readerActivities: ActivityId[] = ['cards','word-choice','lesson','reading','reactor','match','spell','ward','sprint'];
export const youngActivities: ActivityId[] = ['picture-speak','picture-listen'];
export function validateSettings(input: unknown, ids: string[]): Settings {
 const output: Settings = {};
 if(!input || typeof input !== 'object')return output;
 for(const id of ids){const value=(input as Record<string,unknown>)[id] as Partial<UnitSettings>|undefined;
 if(value && Array.isArray(value.activities) && value.activities.length && value.activities.every(a=>allActivities.includes(a)))output[id]={activities:[...new Set(value.activities)],age:typeof value.age==='string'?value.age.slice(0,40):''};
 }return output;
}
export function settingsLink(settings: Settings, unit?: string){const url=new URL(location.href);url.hash='';url.searchParams.set('settings',JSON.stringify(settings));url.searchParams.set('student','1');if(unit)url.searchParams.set('unit',unit);else url.searchParams.delete('unit');url.searchParams.set('v','20261007-review');return url.href;}
export function spokenMatch(transcript: string, expected: string){const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim().replace(/^(?:it's|it is|this is|that is) /,'').replace(/^(?:a|an|the) /,'');return normalize(transcript)===normalize(expected);}

export function configuredActivities(unit: string, shared: Settings, local: Settings, student: boolean): ActivityId[] {return (student?shared[unit]:local[unit])?.activities || (student?[]:allActivities);}

export const activityOptions = [
 ['picture-speak','🎤','Picture → say the word','No reading; record and practise speaking.'],
 ['picture-listen','🔊','Picture → choose the sound','Four audio choices, then OK. No reading.'],
 ['lesson','✨','Guided lesson','Listening, spelling, sentences and reading.'],
 ['cards','📚','Flashcards','Word review with spaced repetition.'],
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
export const youngActivities: ActivityId[] = ['picture-speak','picture-listen'];
export function validateSettings(input: unknown, ids: string[]): Settings {
 const output: Settings = {};
 if(!input || typeof input !== 'object')return output;
 for(const id of ids){const value=(input as Record<string,unknown>)[id] as Partial<UnitSettings>|undefined;
 if(value && Array.isArray(value.activities) && value.activities.length && value.activities.every(a=>allActivities.includes(a)))output[id]={activities:[...new Set(value.activities)],age:typeof value.age==='string'?value.age.slice(0,40):''};
 }return output;
}
export function settingsLink(settings: Settings, unit?: string){const url=new URL(location.href);url.hash=new URLSearchParams({settings:JSON.stringify(settings),...(unit?{unit}: {})}).toString();return url.href;}
export function spokenMatch(transcript: string, expected: string){const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim().replace(/^(?:it's|it is|this is|that is) /,'').replace(/^(?:a|an|the) /,'');return normalize(transcript)===normalize(expected);}

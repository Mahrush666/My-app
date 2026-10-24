export type ReadingScene={id:string;image:string;label:string;full:string[];easy:string[]};
export type IllustratedReading={title:string;audio?:string;references?:{title:string;image:string;audio:string}[];scenes:ReadingScene[];questions:{id:string;scene:string;text:string;options:string[];answer:number;explanation:string}[];orders:{id:string;title:string;scenes:string[]}[]};
// Shared by browser and server. Unknown items and malformed choices are never accepted.
export function checkStoryAnswer(story:IllustratedReading,activity:string,itemId:string,answer:string):boolean|null{
 if(activity==='story-quiz'){
  const q=story.questions.find(q=>q.id===itemId);
  if(!q||!/^\d+$/.test(answer)||Number(answer)>=q.options.length)return null;
  return Number(answer)===q.answer;
 }
 if(activity==='story-order'){
  const round=story.orders.find(r=>r.id===itemId);if(!round)return null;
  const ids=answer.split(',');if(ids.length!==round.scenes.length||new Set(ids).size!==ids.length||ids.some(id=>!round.scenes.includes(id)))return null;
  return ids.every((id,i)=>id===round.scenes[i]);
 }
 return null;
}

import type {Lesson} from '../github-pages/lessons';
import type {ActivityId} from './unit-activities';
import {sentencePracticeWords} from './sentence-practice';
import {yesNoQuestion} from './action-questions';
export type PreviewItem={id:string;title:string;image?:string;audio?:string;video?:string;text?:string[];choices?:string[];correct?:string;images?:{src:string;label:string}[];sourceIndex:number;crop?:{x:number;y:number;width:number;height:number;pageWidth:number;pageHeight:number}};
export function previewItems(lesson:Lesson,activity:ActivityId):PreviewItem[]{
 const story=lesson.readingStory;
 if(activity==='video')return (lesson.videos||[]).map((v,i)=>({id:v.src,title:v.title,image:v.poster,video:v.audioOnly?undefined:v.src,audio:v.audioOnly?v.src:undefined,sourceIndex:i}));
 if(activity==='story')return lesson.story?lesson.story.scenes.map((s,i)=>({id:'story-'+i,title:s.label,image:lesson.story!.image,audio:i===0?lesson.story!.audio:undefined,sourceIndex:i,crop:{...s,pageWidth:lesson.story!.width,pageHeight:lesson.story!.height}})):[];
 if(activity==='story-quiz')return (story?.questions||[]).map((q,i)=>({id:q.id,title:q.text,image:story?.scenes.find(s=>s.id===q.scene)?.image,choices:q.options,correct:q.options[q.answer],text:[q.explanation],sourceIndex:i}));
 if(activity==='story-order')return (story?.orders||[]).map((q,i)=>({id:q.id,title:q.title,images:q.scenes.map(id=>story!.scenes.find(s=>s.id===id)!).filter(Boolean).map(s=>({src:s.image,label:s.label})),text:['Correct picture order shown above.'],sourceIndex:i}));
 if(activity==='reading')return story?story.scenes.map((s,i)=>({id:s.id,title:s.label,image:s.image,text:s.full,audio:i===0?story.audio:undefined,sourceIndex:i})):lesson.readings.map((r,i)=>({id:r.id,title:r.title,text:[r.text],sourceIndex:i}));
 const words=activity==='sentence-speak'&&lesson.sentencePractice?sentencePracticeWords(lesson.sentencePractice):lesson.words;
 const items:PreviewItem[]=words.map((w,i)=>({id:w.id||w.en,title:activity==='sentence-speak'?w.sentence:w.en,image:w.picture,text:activity==='sentence-speak'?[...(w.speakingPrompt?[w.speakingPrompt]:[]),w.sentence]:activity==='yes-no'?[yesNoQuestion(w,true,words)+' → Yes',yesNoQuestion(w,false,words)+' → No']:activity==='sentence-build'?[w.en]:[w.zh,...(activity==='cards'||activity==='lesson'?[w.sentence]:[])].filter(Boolean),sourceIndex:i}));
 if(activity==='lesson')items.push(...lesson.readings.map((r,i)=>({id:r.id,title:r.title,text:[r.text],sourceIndex:i})));
 return items;
}
// Reorder a copy so teachers can try an item without completing preceding questions.
// The complete lesson remains available as the distractor pool.
export function previewFrom(lesson:Lesson,activity:ActivityId,index:number):Lesson{
 const rotate=<T,>(items:T[])=>[...items.slice(index),...items.slice(0,index)];
 if(activity==='video')return {...lesson,videos:rotate(lesson.videos||[])};
 if(activity==='story'&&lesson.story)return {...lesson,story:{...lesson.story,scenes:rotate(lesson.story.scenes)}};
 if(activity==='reading')return lesson.readingStory?{...lesson,readingStory:{...lesson.readingStory,scenes:rotate(lesson.readingStory.scenes)}}:{...lesson,readings:rotate(lesson.readings)};
 if(activity==='story-quiz'&&lesson.readingStory)return {...lesson,readingStory:{...lesson.readingStory,questions:rotate(lesson.readingStory.questions)}};
 if(activity==='story-order'&&lesson.readingStory)return {...lesson,readingStory:{...lesson.readingStory,orders:rotate(lesson.readingStory.orders)}};
 if(activity==='sentence-speak'&&lesson.sentencePractice)return {...lesson,sentencePractice:rotate(lesson.sentencePractice)};
 return {...lesson,words:rotate(lesson.words)};
}

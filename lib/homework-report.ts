import type {HomeworkTime} from './homework-time';
import type {Lesson} from '../github-pages/lessons';
import {activityOptions} from './unit-activities';
import {requiresAnswers} from './homework-completion';
export type ReportAttempt={id:string;activity:string;word_id:string|null;correct:number;created_at:number};
export type ReportQuestion={id:string;prompt:string;expected:string;attempts:{correct:boolean;at:number}[]};
export type HomeworkReport={timing?:HomeworkTime;student:string;title:string;lesson:string;finished:boolean;exercises:{id:string;title:string;questions:ReportQuestion[]}[]};
export function homeworkReport(student:string,assignment:{title:string;activities:string;word_ids:string;updated_at:number},lesson:Lesson,attempts:ReportAttempt[],completed:string[]):HomeworkReport{
 const activities=JSON.parse(assignment.activities) as string[],ids=JSON.parse(assignment.word_ids) as string[];
 const words=lesson.words.filter(w=>ids.includes(w.id!));
 const current=attempts.filter(a=>Number(a.created_at)>=Number(assignment.updated_at));
 const exercises=activities.filter(requiresAnswers).map(activity=>{
  const questions:ReportQuestion[]=[];
  function add(id:string,prompt:string,expected:string,kind=activity){questions.push({id:kind+':'+id,prompt,expected,attempts:current.filter(a=>a.activity===kind&&a.word_id===id).map(a=>({correct:Number(a.correct)===1,at:Number(a.created_at)}))})}
  if(activity==='story-quiz')for(const q of lesson.readingStory?.questions||[])add(q.id,q.text,q.options[q.answer]);
  else if(activity==='story-order')for(const q of lesson.readingStory?.orders||[])add(q.id,q.title,q.scenes.map(id=>lesson.readingStory!.scenes.find(s=>s.id===id)?.label||id).join(' → '));
  else if(activity==='sentence-speak'){
   if(lesson.sentencePractice)for(const q of lesson.sentencePractice)add(q.id,q.prompt||'Read the sentence 朗读句子',q.text);
   else for(const w of words.filter(w=>w.sentence.trim().split(/\s+/).length>1))add(w.id!,'Read the sentence 朗读句子',w.sentence);
  }else if(activity==='lesson'){
   for(const stage of ['listen','spell','sentence'])for(const w of words){if(stage==='sentence'&&(!w.sentence||w.sentence.trim().split(/\s+/).length<2))continue;add(w.id!,'Guided lesson · '+stage,stage==='sentence'?w.sentence:w.en,'lesson:'+stage)}
  }else for(const w of words){
   if(activity==='reactor'){
    const variants=[['build','Build the word from letters 拼单词'],['spelling','Choose the correct spelling 选正确拼写'],['meaning','Choose the English word for '+w.zh]];
    let found=false;
    for(const [type,prompt] of variants)if(current.some(a=>a.activity==='reactor:'+type&&a.word_id===w.id)){found=true;add(w.id!,prompt,w.en,'reactor:'+type)}
    if(found&&!current.some(a=>a.activity==='reactor'&&a.word_id===w.id))continue;
   }

   if(activity==='spell')for(let step=1;step<5;step++)if(current.some(a=>a.activity==='spell:step'+step&&a.word_id===w.id))add(w.id!,'Spelling · Step '+step,w.en,'spell:step'+step);
   const labels:Record<string,string>={'sentence-build':'Build the sentence 组句子','word-choice':'Choose the written word 选单词','picture-listen':'Picture → choose the sound 看图选音','word-sound':'Read → choose the sound 读词选音','sound-word':'Listen → choose the word 听音选词','sound-picture':'Listen → choose the picture 听音选图','yes-no':'Look, listen and answer yes/no 看图听音判断','spell':'Spell the whole word 完整拼写','reactor':'Word Reactor · vocabulary challenge 单词挑战'};
   add(w.id!,labels[activity]||'Practise the word 练习词汇',w.en);
  }
  return {id:activity,title:activityOptions.find(a=>a[0]===activity)?.[2]||activity,questions};
 });
 return {student,title:assignment.title,lesson:lesson.title,finished:activities.filter(requiresAnswers).every(a=>completed.includes(a)),exercises};
}

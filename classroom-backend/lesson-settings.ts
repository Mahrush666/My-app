import type {D1Database} from '@cloudflare/workers-types';
import type {Lesson} from '../github-pages/lessons';
import {validateSettings,type Settings} from '../lib/unit-activities';
import {requiresAnswers} from '../lib/homework-completion';
export async function publishedSettings(db:D1Database,lessons:Lesson[]):Promise<Settings>{
 const rows=await db.prepare("SELECT key,value FROM config WHERE key LIKE 'lesson_settings:%'").all<{key:string;value:string}>();
 const raw:Record<string,unknown>={};for(const row of rows.results){try{raw[row.key.slice('lesson_settings:'.length)]=JSON.parse(row.value)}catch{}}
 return validateSettings(raw,lessons.map(l=>l.id));
}
export function assignmentSettingsUpdates(db:D1Database,assignment:{id:string;group_id:string;word_ids:string;updated_at:number},lesson:Lesson,activities:string[]){
 const words=JSON.parse(assignment.word_ids) as string[];
 const statements=[db.prepare('UPDATE assignments SET activities=? WHERE id=?').bind(JSON.stringify(activities),assignment.id),db.prepare('DELETE FROM completions WHERE assignment_id=?').bind(assignment.id)];
 for(const activity of activities.filter(requiresAnswers)){
  const sentences=lesson.sentencePractice?.length??lesson.words.filter(w=>words.includes(w.id!)&&w.sentence.trim().split(/\s+/).length>1).length;
  const required=activity==='story-quiz'?lesson.readingStory?.questions.length||0:activity==='story-order'?lesson.readingStory?.orders.length||0:activity==='sentence-speak'?sentences:activity==='lesson'?words.length*2+Math.min(4,sentences):words.length;
  if(!required)continue;
  const filter=activity==='lesson'?"t.activity IN ('lesson:listen','lesson:spell','lesson:sentence')":activity==='reactor'?"t.activity IN ('reactor','reactor:build','reactor:spelling','reactor:meaning')":'t.activity=?';
  const distinct=activity==='lesson'?'t.activity || t.word_id':'t.word_id';
  statements.push(db.prepare(`INSERT OR IGNORE INTO completions(child_id,assignment_id,activity,completed_at) SELECT c.id,?,?,? FROM children c WHERE c.group_id=? AND c.approved=1 AND (SELECT COUNT(DISTINCT ${distinct}) FROM attempts t WHERE t.child_id=c.id AND t.assignment_id=? AND t.correct=1 AND t.created_at>=? AND ${filter})>=?`).bind(assignment.id,activity,Date.now(),assignment.group_id,assignment.id,assignment.updated_at,...(['lesson','reactor'].includes(activity)?[]:[activity]),required));
 }
 return statements;
}

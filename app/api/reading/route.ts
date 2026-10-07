import { env } from 'cloudflare:workers';
import { student } from '@/lib/auth';
import { db } from '@/lib/db';
import { passages } from '../../passages';
import { alignReading } from '@/lib/alignment';
const config=()=>env as unknown as {OPENAI_API_KEY?:string};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){try{return json({available:Boolean(config().OPENAI_API_KEY)&&Boolean(await student(request))})}catch{return json({available:false})}}
export async function POST(request:Request){
 const key=config().OPENAI_API_KEY;if(!key)return json({error:'AI listening is not available yet. You can still record and listen.'},503);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Please send recordings from this app.'},403);
 const length=Number(request.headers.get('content-length'));if(length>3_000_000)return json({error:'Please record a shorter clip.'},413);
 try{
 const learner=await student(request);if(!learner)return json({error:'Enter your student code before using AI listening.'},401);
 const form=await request.formData();const unitId=String(form.get('unitId')||'');const unit=await db().prepare('SELECT u.readings FROM units u JOIN class_units cu ON cu.unit_id=u.id WHERE u.id=? AND cu.class_id=? AND u.published=1').bind(unitId,learner.class_id).first<{readings:string}>();if(!unit)return json({error:'Choose an assigned lesson.'},403);
 const availablePassages=JSON.parse(unit.readings) as typeof passages;const passage=availablePassages.find(p=>p.id===form.get('passage'));const audio=form.get('audio');
 if(!passage||form.get('consent')!=='yes'||!(audio instanceof File))return json({error:'Choose a passage and allow AI listening first.'},400);
 if(audio.size<100||audio.size>2_000_000||!['audio/webm','audio/mp4','audio/ogg','audio/wav'].includes(audio.type.split(';')[0]))return json({error:'Use a recording of up to 30 seconds.'},400);
 const body=new FormData();body.set('file',audio);body.set('model','gpt-4o-mini-transcribe');body.set('language','en');body.set('response_format','json');
 const response=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${key}`},body,signal:AbortSignal.timeout(45000)});
 if(!response.ok)return json({error:'AI could not listen this time. Please try again later.'},502);
 const data=await response.json() as {text?:string};const heard=(data.text||'').trim().slice(0,2000);
 if(!heard)return json({error:'No words were heard. Try again in a quiet place.'},422);
 return json({transcript:heard,...alignReading(passage.text,heard)});
 }catch{return json({error:'We could not check this recording. Please try again.'},500)}
}

import {handle,type Env} from '../../classroom-backend/worker';
import {remoteDatabase} from './database';
declare const Deno:{env:{get(key:string):string|undefined};serve(handler:(r:Request)=>Promise<Response>):void};
const database=remoteDatabase(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
let verifier:string|undefined;
Deno.serve(async request=>{
 const url=new URL(request.url),start=url.pathname.indexOf('/classroom');url.pathname=start<0?url.pathname:url.pathname.slice(start+'/classroom'.length)||'/';
 const headers=new Headers(request.headers);headers.delete('Authorization');const session=headers.get('X-Wordquest-Session');if(session)headers.set('Authorization','Bearer '+session);
 headers.set('CF-Connecting-IP',headers.get('x-real-ip')||headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()||'unknown');
 const forwarded=new Request(url,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:await request.arrayBuffer()});
 try{if(!verifier)verifier=(await database.prepare("SELECT value FROM config WHERE key='teacher_password_hash'").first<{value:string}>())?.value;return await handle(forwarded,{DB:database as unknown as Env['DB'],ALLOWED_ORIGINS:'https://mahrush666.github.io',TEACHER_PASSWORD_HASH:verifier});}
 catch{return Response.json({error:'Classroom service could not load. Please try again.'},{status:503,headers:{'Access-Control-Allow-Origin':'https://mahrush666.github.io','Vary':'Origin','Cache-Control':'no-store'}});}
});

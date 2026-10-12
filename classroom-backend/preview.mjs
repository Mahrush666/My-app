// Local demonstration only. Profiles and results disappear when this process stops.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {localDatabase} from './sqlite-adapter.mjs';
import {handle} from '../dist-classroom/worker.mjs';
const root=fileURLToPath(new URL('../dist-pages/',import.meta.url));
const port=Number(process.env.WORDQUEST_PREVIEW_PORT||5174);
const origin='http://127.0.0.1:'+port;
const DB=localDatabase();
const env={DB,ALLOWED_ORIGINS:origin,TEACHER_PASSWORD:'local-demo-only'};
const routes=new Set(['/health','/register','/login','/teacher-login','/logout','/teacher','/groups','/invite','/approve','/assignments','/delete-assignment','/family','/children','/homework','/progress','/teacher-students','/move-student','/student-invite','/student-claim','/student-link','/student-login']);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.m4a':'audio/mp4','.mp3':'audio/mpeg','.mp4':'video/mp4'};
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,origin);
 if(url.pathname==='/classroom-config.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({endpoint:origin}));return}
 if(routes.has(url.pathname)){
 let chunks=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>30000){res.writeHead(413);res.end();return}chunks.push(chunk)}
 const result=await handle(new Request(url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)}),env);res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;
 }
 const filename=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!filename.startsWith(root)){res.writeHead(403);res.end();return}
 const bytes=await readFile(filename);const mime=types[extname(filename)]||'application/octet-stream';const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
 if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):bytes.length-1,bytes.length-1);if(start>end){res.writeHead(416,{'Content-Range':'bytes */'+bytes.length});res.end();return}res.writeHead(206,{'Content-Type':mime,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});res.end(bytes.subarray(start,end+1))}
 else{res.writeHead(200,{'Content-Type':mime,'Content-Length':bytes.length,'Cache-Control':'no-store'});res.end(bytes)}
 }catch{res.writeHead(404);res.end('Not found')}});
server.listen(port,'127.0.0.1',()=>console.log('Local classroom preview: '+origin+'/#view=classroom\nTeacher demo password: local-demo-only\nTest profiles only. All demo data is erased when this preview stops.'));

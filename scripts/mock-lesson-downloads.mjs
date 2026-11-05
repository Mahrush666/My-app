import fs from 'node:fs';
// Browser UI tests load real local lesson files without an external HTTP server.
export function mockLessonDownloads(window){
 window.fetch=async source=>{
  const path=new URL(String(source),window.location.href).pathname.replace(/^\/My-app\//,'/');
  try{return new window.Response(fs.readFileSync('public'+path),{status:200})}catch{return new window.Response('missing',{status:404})}
 };
 let next=0;window.URL.createObjectURL=()=> 'blob:https://example.com/lesson-test-'+next++;window.URL.revokeObjectURL=()=>{};
}

// Private PNGs are served through short-lived, signed attachment URLs.
const bucket='wordquest-qr-downloads';
export function createQrStorage(base:string,key:string,send:typeof fetch=fetch){
 const root=base.replace(/\/$/,'')+'/storage/v1',auth={apikey:key,Authorization:'Bearer '+key};let ready:Promise<void>|undefined,lastCleanup=0;
 async function json<T>(path:string,method:string,body?:unknown):Promise<T>{const r=await send(root+path,{method,headers:{...auth,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw Error('Could not prepare the QR download. Please retry.');return r.json() as Promise<T>}
 async function ensureBucket(){const r=await send(root+'/bucket/'+bucket,{headers:auth});if(r.ok){const info=await r.json() as {public:boolean};if(info.public)throw Error('QR download storage must be private.');return}
  if(r.status!==404&&r.status!==400)throw Error('Could not prepare QR download storage.');
  const created=await send(root+'/bucket',{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({id:bucket,name:bucket,public:false,file_size_limit:262144,allowed_mime_types:['image/png']})});
  if(!created.ok){const check=await send(root+'/bucket/'+bucket,{headers:auth});if(!check.ok||(await check.json() as {public:boolean}).public)throw Error('Could not prepare private QR download storage.')}
 }
 async function cleanup(now:number){if(now-lastCleanup<60000)return;lastCleanup=now;try{const files=await json<{name:string;created_at:string}[]>('/object/list/'+bucket,'POST',{prefix:'temporary',limit:100,sortBy:{column:'created_at',order:'asc'}});const expired=files.filter((f:{name:string;created_at:string})=>Date.parse(f.created_at)<now-3600000).map((f:{name:string})=>'temporary/'+f.name);if(expired.length)await json('/object/'+bucket,'DELETE',{prefixes:expired})}catch{/* A cleanup retry must not block saving the current QR. */}}
 return async(png:Uint8Array,filename:string)=>{
  try{await(ready??=ensureBucket())}catch(e){ready=undefined;throw e}
  const now=Date.now(),path='temporary/'+now+'-'+crypto.randomUUID()+'.png';
  const uploaded=await send(root+'/object/'+bucket+'/'+path,{method:'POST',headers:{...auth,'Content-Type':'image/png','Cache-Control':'no-store'},body:png as BodyInit});if(!uploaded.ok)throw Error('Could not upload the QR download. Please retry.');
  const signed=await json<{signedURL:string}>('/object/sign/'+bucket+'/'+path,'POST',{expiresIn:900});
  const url=new URL(root+signed.signedURL);url.searchParams.set('download',filename);
  await cleanup(now);
  return {url:url.href,expiresAt:now+900000};
 };
}

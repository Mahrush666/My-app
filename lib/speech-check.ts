import {publicAsset} from './public-runtime';
export type SpeechCheck = {status:'recognized'|'unclear';transcript:string};
export async function speechEndpoint():Promise<string> {
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),8000);
 try {
  const response=await fetch(publicAsset('speech-config.json'),{cache:'no-store',signal:controller.signal});
  if(!response.ok)return '';
  const config=await response.json();
  if(typeof config.endpoint!=='string'||!config.endpoint)return '';
  const url=new URL(config.endpoint);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))return '';
  return url.href;
 }finally{clearTimeout(timeout)}
}
export async function checkSpeech(endpoint:string,clip:Blob,signal:AbortSignal):Promise<SpeechCheck> {
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':clip.type||'audio/webm'},body:clip,signal});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(response.status===429?'busy':response.status===503?'not_configured':'unavailable');
 if((data.status!=='recognized'&&data.status!=='unclear')||typeof data.transcript!=='string')throw new Error('unavailable');
 return {status:data.status,transcript:data.transcript};
}

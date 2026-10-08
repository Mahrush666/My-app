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
// Check the same host and CORS route, without uploading audio or using Groq quota.
export async function checkSpeechConnection(endpoint:string,signal?:AbortSignal):Promise<void> {
 const controller=new AbortController();
 const abort=()=>controller.abort();
 signal?.addEventListener('abort',abort,{once:true});
 if(signal?.aborted)controller.abort();
 const timeout=setTimeout(abort,4000);
 try {
  const response=await fetch(endpoint,{method:'OPTIONS',signal:controller.signal});
  if(!response.ok)throw new Error('connection');
 }catch{throw new Error('connection')}
 finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort)}
}
export function speechFailureMessage(error:unknown):string {
 const reason=error instanceof Error?error.message:'';
 if(reason==='connection')return 'Cannot reach the voice checker on this connection. Recording saved; a parent can listen and rate it. 无法连接语音检查服务，录音已保存，请家长听后评价。';
 if(reason==='busy')return 'The checker is busy or its free allowance is used up. Try later. 检查服务繁忙或免费额度已用完，请稍后重试。';
 if(reason==='not_configured')return 'Voice checking needs the teacher to finish its setup. 语音检查需要老师完成设置。';
 if(reason==='invalid_audio')return 'The checker could not read this recording. Try a short recording in another browser. 无法读取录音，请用其他浏览器录一段短语音。';
 if(reason==='network')return 'The connection was interrupted while sending the recording. Recording saved; please try again. 上传录音时连接中断，录音已保存，请重试。';
 if(error instanceof Error&&error.name==='AbortError')return 'The voice check took too long. Recording saved; please try again or ask a parent to listen. 检查超时，录音已保存，请重试或请家长听。';
 return 'The voice service could not check this recording. Recording saved; try later or ask a parent to listen. 语音服务暂时无法检查，录音已保存，请稍后重试或请家长听。';
}
export async function checkSpeech(endpoint:string,clip:Blob,signal:AbortSignal):Promise<SpeechCheck> {
 await checkSpeechConnection(endpoint,signal);
 let response:Response;
 try {response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':clip.type||'audio/webm'},body:clip,signal})}
 catch(error){if(signal.aborted)throw error;throw new Error('network')}
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(response.status===429?'busy':response.status===503?'not_configured':[413,415,422].includes(response.status)?'invalid_audio':'unavailable');
 if((data.status!=='recognized'&&data.status!=='unclear')||typeof data.transcript!=='string')throw new Error('unavailable');
 return {status:data.status,transcript:data.transcript};
}

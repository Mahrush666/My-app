import {classroomEndpointForPage,trialClassroomEndpoint} from './classroom-trial';
import gateway from './classroom-gateway.json';
import {publicAsset} from './public-runtime';
export type ClassroomSession={token:string;role:'parent'|'teacher'|'student';endpoint:string};
const key='wordquest-classroom-session-v1';
const expiredListeners=new Set<(session:ClassroomSession)=>void>();
export function onSessionExpired(listener:(session:ClassroomSession)=>void){expiredListeners.add(listener);return()=>{expiredListeners.delete(listener)}}
export function sessionSaved():ClassroomSession|null{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
export function saveSession(value:ClassroomSession|null){if(value)localStorage.setItem(key,JSON.stringify(value));else localStorage.removeItem(key)}
export function endpointValid(value:string){const url=new URL(value);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error('Use an HTTPS backend address.');if(url.username||url.password||url.search||url.hash)throw Error('Use a backend address without credentials or query parameters.');return url.origin+url.pathname.replace(/\/+$/,'')}
export async function configuredEndpoint(){const r=await fetch(publicAsset('classroom-config.json'),{cache:'no-store'});if(!r.ok)return '';const d=await r.json() as {endpoint?:string};return d.endpoint?classroomEndpointForPage(endpointValid(d.endpoint)):''}
export function classroomHeaders(endpoint:string,token?:string):Record<string,string>{return (endpoint===gateway.endpoint||endpoint===trialClassroomEndpoint)?{apikey:gateway.anonKey,Authorization:'Bearer '+gateway.anonKey,...(token?{'X-Wordquest-Session':token}:{})}:token?{Authorization:'Bearer '+token}:{}}
export async function classroomRequest<T>(endpoint:string,path:string,data?:unknown,session?:ClassroomSession|null):Promise<T>{
 const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),12000);
 try{const r=await fetch(endpoint+path,{method:data===undefined?'GET':'POST',headers:{...(data===undefined?{}:{'Content-Type':'application/json'}),...classroomHeaders(endpoint,session?.token)},body:data===undefined?undefined:JSON.stringify(data),signal:abort.signal,keepalive:path==='/homework-time'});const d=await r.json() as T&{error?:string};
 // Only the classroom's explicit rejection of a saved session requires signing in again.
 // Connection failures, permission errors and incorrect login attempts keep the current session.
 if(r.status===401&&d.error==='Please sign in.'&&session){for(const listener of expiredListeners)listener(session);throw Error('Your sign-in has expired. Please sign in again. 登录已过期，请重新登录。')}
 if(!r.ok)throw Error(d.error||'Could not open this classroom.');return d}
 catch(e){if(e instanceof TypeError||e instanceof Error&&e.name==='AbortError')throw Error('Cannot reach the classroom. Check your connection and try again. 无法连接教室，请重试。');throw e}
 finally{clearTimeout(timeout)}
}

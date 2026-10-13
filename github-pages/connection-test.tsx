import {useEffect,useState} from 'react';
import {publicAsset} from '../lib/public-runtime';
import {endpointValid,classroomHeaders} from '../lib/classroom-client';
type Check={name:string;ok:boolean;detail:string};
export default function ConnectionTest(){
 const [checks,setChecks]=useState<Check[]>([]),[running,setRunning]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let live=true;setChecks([]);setRunning(true);
 async function test(name:string,url:string,init?:RequestInit,expected=200){const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),8000),start=Date.now();try{const headers=new Headers(init?.headers);if(!url.endsWith('classroom-config.json')){const base=url.slice(0,url.lastIndexOf('/'));const token=headers.get('Authorization')?.replace(/^Bearer /,'');for(const [key,value]of Object.entries(classroomHeaders(base,token)))headers.set(key,value);}const r=await fetch(url,{...init,headers,signal:abort.signal});const body=await r.json();const ok=r.status===expected;const result={name,ok,detail:`${ok?'Connected':'Unexpected response'} · HTTP ${r.status} · ${Date.now()-start} ms`};if(live)setChecks(c=>[...c,result]);return {body,ok};}catch(e){if(live)setChecks(c=>[...c,{name,ok:false,detail:e instanceof Error&&e.name==='AbortError'?'Timed out after 8 seconds 超时':'Browser could not read the response 浏览器无法连接'}]);return null}finally{clearTimeout(timer)}}
 (async()=>{const config=await test('1. App settings 应用设置',publicAsset('classroom-config.json'));if(!config?.ok)return;let endpoint:string;try{const value=(config.body as {endpoint?:unknown})?.endpoint;if(typeof value!=='string')throw Error('Missing address');endpoint=endpointValid(value)}catch{if(live)setChecks(c=>[...c,{name:'Backend address',ok:false,detail:'Missing or invalid classroom address'}]);return;}
 await Promise.all([
 test('2. Server connection 服务器连接',endpoint+'/health'),
 test('3. Simple browser request 简单请求',endpoint+'/student-login',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({access:'connection-test-only'})},401),
 test('4. Login connection 登录连接',endpoint+'/student-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access:'connection-test-only'})},401),
 test('5. Homework connection 作业连接',endpoint+'/family',{headers:{Authorization:'Bearer '+'0'.repeat(64)}},401)
 ]);})().finally(()=>{if(live)setRunning(false)});return()=>{live=false};},[attempt]);
 const sorted=[...checks].sort((a,b)=>a.name.localeCompare(b.name));
 const report=['WordQuest connection test',new Date().toISOString(),`Browser: ${navigator.userAgent}`,...sorted.map(c=>`${c.ok?'PASS':'FAIL'} ${c.name}: ${c.detail}`)].join('\n');
 return <section className="panel"><h1>Check the connection 连接测试</h1><p>This checks WeChat’s connection without using a student QR or password. 测试无需学生二维码或密码。</p>{running&&<p role="status">Testing… 正在测试…</p>}<ul>{sorted.map(c=><li key={c.name}><strong>{c.ok?'✓':'✕'} {c.name}</strong><p>{c.detail}</p></li>)}</ul>{!running&&checks.some(c=>!c.ok)&&<p className="notice">Please send your teacher the results below. These results help distinguish a server connection failure from a browser request failure. 请将下方结果发给老师。</p>}<label>Results 测试结果<textarea readOnly rows={10} value={report} onFocus={e=>e.target.select()}/></label><button disabled={running} onClick={()=>setAttempt(n=>n+1)}>Test again 重新测试</button></section>
}

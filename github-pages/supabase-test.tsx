import {useEffect,useState} from 'react';
import {publicAsset} from '../lib/public-runtime';
type Check={name:string;ok:boolean;detail:string};
export default function SupabaseTest(){
 const [checks,setChecks]=useState<Check[]>([]),[running,setRunning]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let live=true;setChecks([]);setRunning(true);
 async function test(name:string,url:string,init?:RequestInit,valid:(body:any)=>boolean=()=>true,expected=200){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000),start=Date.now();try{const response=await fetch(url,{...init,signal:controller.signal,cache:'no-store'}),body=await response.json(),ok=response.status===expected&&valid(body);if(live)setChecks(c=>[...c,{name,ok,detail:`${ok?(expected===404?'Connected (expected missing test table)':'Connected'):'Unexpected response'} · HTTP ${response.status} · ${Date.now()-start} ms`}]);return ok?body:null;}catch(e){if(live)setChecks(c=>[...c,{name,ok:false,detail:e instanceof Error&&e.name==='AbortError'?'Timed out after 8 seconds 超时':'Browser could not read the response 浏览器无法连接'}]);return null;}finally{clearTimeout(timer)}}
 (async()=>{const config=await test('1. Test settings 测试设置',publicAsset('supabase-test-config.json')) as {endpoint?:unknown;anonKey?:unknown;publishableKey?:unknown}|null;if(!config)return;
 if(config.endpoint!=='https://lzsljehuuezdlssrgzwe.supabase.co'||typeof config.anonKey!=='string'||typeof config.publishableKey!=='string'){if(live)setChecks(c=>[...c,{name:'Configuration',ok:false,detail:'Invalid test settings'}]);return;}
 const api={apikey:config.publishableKey},fn={apikey:config.anonKey,Authorization:'Bearer '+config.anonKey};
 await Promise.all([
 test('2. Account service 账号服务',config.endpoint+'/auth/v1/health',{headers:api},b=>b.name==='GoTrue'),
 test('3. Database gateway 数据库连接',config.endpoint+'/rest/v1/wordquest_connection_probe?select=id&limit=0',{headers:api},b=>b.code==='PGRST205',404),
 test('4. Server function 服务器功能',config.endpoint+'/functions/v1/connection-check',{headers:fn},b=>b.status==='ready'&&b.method==='GET'),
 test('5. Submit request 提交请求',config.endpoint+'/functions/v1/connection-check',{method:'POST',headers:{...fn,'Content-Type':'application/json'},body:'{}'},b=>b.status==='ready'&&b.method==='POST')]);
 })().finally(()=>{if(live)setRunning(false)});return()=>{live=false};},[attempt]);
 const sorted=[...checks].sort((a,b)=>a.name.localeCompare(b.name));
 const report=['WordQuest Supabase connection trial',new Date().toISOString(),`Browser: ${navigator.userAgent}`,...sorted.map(c=>`${c.ok?'PASS':'FAIL'} ${c.name}: ${c.detail}`)].join('\n');
 return <section className="panel"><h1>Supabase connection test 连接测试</h1><p>Please test in WeChat without VPN, then send Max the results. 请关闭 VPN，在微信中测试，并将结果发给老师。</p><p>This is a connection trial. Your homework has not moved yet. 此页面仅测试连接，作业尚未迁移。</p>{running&&<p role="status">Testing… 正在测试…</p>}<ul>{sorted.map(c=><li key={c.name}><strong>{c.ok?'✓':'✕'} {c.name}</strong><p>{c.detail}</p></li>)}</ul><label>Results 测试结果<textarea readOnly rows={11} value={report} onFocus={e=>e.target.select()}/></label><button disabled={running} onClick={()=>setAttempt(n=>n+1)}>Test again 重新测试</button><p className="small-note">No student information or password is used. Audio/video access and homework sign-in still need separate tests. 测试不使用学生资料或密码。</p></section>;
}

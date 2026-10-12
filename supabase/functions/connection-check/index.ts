export {};
declare const Deno:{serve(handler:(request:Request)=>Response|Promise<Response>):void};
// Public connectivity probe: no database queries, credentials or student data.
const allowedOrigin='https://mahrush666.github.io';
Deno.serve(async(request:Request)=>{
 const origin=request.headers.get('Origin');
 const headers:Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
 if(origin&&origin!==allowedOrigin)return new Response(JSON.stringify({error:'Origin not allowed'}),{status:403,headers});
 if(origin){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type, Authorization, apikey, x-client-info';}
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(!['GET','POST'].includes(request.method))return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers});
 if(request.method==='POST'){const body=await request.text();if(body.length>1024)return new Response(JSON.stringify({error:'Request too large'}),{status:413,headers});}
 return new Response(JSON.stringify({status:'ready',service:'wordquest-supabase-connection-test',method:request.method}),{headers});
});

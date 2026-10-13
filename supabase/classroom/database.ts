type Statement={sql:string;params:unknown[];rows:boolean};
type Result={results:Record<string,unknown>[];success:boolean;meta:{changes:number}};
export function postgresSQL(sql:string){
 const ignore=/INSERT OR IGNORE INTO/i.test(sql);
 let q=sql.replace(/INSERT OR IGNORE INTO/gi,'INSERT INTO').replace(/MIN\(reviews\.step\+1,4\)/g,'LEAST(reviews.step+1,4)').replace('count=count+1','count=login_limits.count+1').replace(/json_group_array\(activity\)/g,"COALESCE(json_agg(activity),'[]'::json)::text");
 if(ignore)q+=' ON CONFLICT DO NOTHING';return q;
}
export function classroomDatabase(execute:(items:Statement[])=>Promise<Result[]>){
 class Prepared{
  params:unknown[]=[];constructor(public sql:string){}
  bind(...params:unknown[]){this.params=params;return this;}
  item(rows=false):Statement{return {sql:postgresSQL(this.sql),params:this.params,rows};}
  async first<T=Record<string,unknown>>(){const r=await execute([this.item(true)]);return (r[0].results[0]||null) as T|null;}
  async all(){return (await execute([this.item(true)]))[0];}
  async run(){return (await execute([this.item()]))[0];}
 }
 return{prepare:(sql:string)=>new Prepared(sql),batch:(items:Prepared[])=>execute(items.map(i=>i.item()))};
}
export function remoteDatabase(url:string,serviceKey:string){
 return classroomDatabase(async statements=>{const r=await fetch(url+'/rest/v1/rpc/wordquest_batch',{method:'POST',headers:{apikey:serviceKey,Authorization:'Bearer '+serviceKey,'Content-Type':'application/json'},body:JSON.stringify({statements}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Database request failed: '+r.status);return await r.json();});
}

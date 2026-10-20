// Compare the entire sentence; a single target word is never enough.
export function speechMatches(text:string,expected:string){
 const normalize=(value:string)=>value.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z\s']/g,' ').replace(/\b(i'm)\b/g,'i am').replace(/\b(it's)\b/g,'it is').replace(/\b(he's)\b/g,'he is').replace(/\b(she's)\b/g,'she is').replace(/\b(they're)\b/g,'they are').replace(/\b(we're)\b/g,'we are').replace(/\b(can't)\b/g,'cannot').replace(/\s+/g,' ').trim();
 const target=normalize(expected);
 return target.split(' ').length>1&&normalize(text)===target;
}
export function speechSamples(chunks:Float32Array[],rate:number){
 const total=chunks.reduce((n,c)=>n+c.length,0),input=new Float32Array(total);let offset=0;
 for(const chunk of chunks){input.set(chunk,offset);offset+=chunk.length}
 const result=new Float32Array(Math.floor(total*16000/rate));
 for(let i=0;i<result.length;i++){const pos=i*rate/16000,a=Math.floor(pos),fraction=pos-a;result[i]=input[a]*(1-fraction)+(input[Math.min(a+1,input.length-1)]||0)*fraction;}
 return result;
}
export function speechAudible(audio:Float32Array){return audio.length>=6400&&Math.sqrt(audio.reduce((n,x)=>n+x*x,0)/audio.length)>.004;}

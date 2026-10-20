export function speechMatches(text:string,word:string){
 const normalized=text.toLowerCase().replace(/[^a-z\s']/g,' ').replace(/\s+/g,' ').trim();
 return normalized===word||normalized==='i can '+word;
}
export function speechSamples(chunks:Float32Array[],rate:number){
 const total=chunks.reduce((n,c)=>n+c.length,0),input=new Float32Array(total);let offset=0;
 for(const chunk of chunks){input.set(chunk,offset);offset+=chunk.length}
 const result=new Float32Array(Math.floor(total*16000/rate));
 for(let i=0;i<result.length;i++){const pos=i*rate/16000,a=Math.floor(pos),fraction=pos-a;result[i]=input[a]*(1-fraction)+(input[Math.min(a+1,input.length-1)]||0)*fraction;}
 return result;
}
export function speechAudible(audio:Float32Array){return audio.length>=6400&&Math.sqrt(audio.reduce((n,x)=>n+x*x,0)/audio.length)>.004;}

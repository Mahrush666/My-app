// Observe microphone volume locally; do not connect the microphone to speakers.
export async function recordingLevel(stream:MediaStream):Promise<{hasSound:()=>boolean;close:()=>void}|null> {
 const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!Constructor)return null;
 const context=new Constructor();
 try {
  await context.resume();
  const source=context.createMediaStreamSource(stream),analyser=context.createAnalyser();
  analyser.fftSize=2048;source.connect(analyser);
  const samples=new Float32Array(analyser.fftSize);
  let audibleFrames=0;
  const poll=setInterval(()=>{analyser.getFloatTimeDomainData(samples);const energy=samples.reduce((sum,x)=>sum+x*x,0)/samples.length;if(Math.sqrt(energy)>0.008)audibleFrames++;},40);
  return {hasSound:()=>audibleFrames>=2,close:()=>{clearInterval(poll);source.disconnect();analyser.disconnect();void context.close().catch(()=>{})}};
 }catch{void context.close().catch(()=>{});return null}
}

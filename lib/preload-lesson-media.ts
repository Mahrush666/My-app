import type {MediaFile} from './lesson-media';
import {rememberMedia,retainMedia} from './media-memory';
export type LoadProgress={loaded:number;total:number;failed:number};
export const practiceStartDelayMs=4000;
export async function preloadLessonMedia(files:MediaFile[],user:symbol,signal:AbortSignal,onProgress:(value:LoadProgress)=>void){
 let index=0,loaded=0,failed=0;
 const update=()=>{if(!signal.aborted)onProgress({loaded,total:files.length,failed})};
 update();
 async function worker(){
  while(!signal.aborted&&index<files.length){
   const file=files[index++];
   if(retainMedia(file.src,user)){loaded++;update();continue}
   const controller=new AbortController(),abort=()=>controller.abort();signal.addEventListener('abort',abort,{once:true});
   const timer=setTimeout(abort,12000);
   try{
    // Reuse fresh browser cache entries, and read the whole file for local playback.
    const response=await fetch(file.src,{signal:controller.signal});
    if(!response.ok||response.headers.get('content-type')?.includes('text/html'))throw Error('Media unavailable');
    const blob=await response.blob();if(!blob.size)throw Error('Empty media');
    if(signal.aborted)return;
    rememberMedia(file.src,blob,user);loaded++;
   }catch{if(!signal.aborted)failed++}
   finally{clearTimeout(timer);signal.removeEventListener('abort',abort)}
   update();
  }
 }
 // Limit concurrency to keep mobile connections responsive and memory use steady.
 await Promise.all(Array.from({length:4},worker));
 return {loaded,total:files.length,failed};
}

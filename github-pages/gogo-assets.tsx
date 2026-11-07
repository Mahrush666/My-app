import {createContext,useContext,useEffect,useMemo,useRef,useState,type ImgHTMLAttributes,type ReactNode} from 'react';
import {publicAssetPath} from '../lib/public-runtime';
import {practiceStartDelayMs} from '../lib/preload-lesson-media';
import manifest from '../public/mascots/gogo/manifest.json';

type Artwork={blob:Blob;url:string};
const ArtworkContext=createContext<ReadonlyMap<string,Artwork>>(new Map());
// Bump this namespace when replacing the artwork, so old copies cannot win.
const CACHE='wordquest-gogo-art-v1';
export function useGogoArtwork(){return useContext(ArtworkContext)}
export function GogoImage({src,...props}:Omit<ImgHTMLAttributes<HTMLImageElement>,'src'>&{src?:string}){const artwork=useGogoArtwork();return <img {...props} src={src?artwork.get(src)?.url||src:undefined}/>}

async function download(src:string,signal:AbortSignal):Promise<Blob>{
 let cache:Cache|undefined;
 const mascot=src.startsWith(publicAssetPath('mascots/gogo/'));
 if(mascot)try{cache=await caches.open(CACHE)}catch{/* Private browsers can still use memory and HTTP caching. */}
 const key=new URL(src,document.baseURI).href;
 try{const saved=await cache?.match(key);if(saved?.ok){const blob=await saved.blob();if(blob.size)return blob}}catch{}
 const response=await fetch(src,{cache:mascot?'force-cache':'default',signal});
 if(!response.ok||response.headers?.get('content-type')?.includes('text/html'))throw Error('Artwork download failed');
 const copy=cache?response.clone():undefined;
 const blob=await response.blob();
 if(!blob.size)throw Error('Empty artwork');
 if(copy&&!signal.aborted)void cache!.put(key,copy).catch(()=>{});
 return blob;
}

export default function GogoAssets({pictures,children,onReady,onExit}:{pictures:string[];children:ReactNode;onReady:(ready:boolean)=>void;onExit:()=>void}){
 const key=JSON.stringify([...new Set([
  publicAssetPath('mascots/gogo/stage-01.webp'),...pictures.slice(0,4),
  publicAssetPath('mascots/gogo/idle.webp'),publicAssetPath('mascots/gogo/pizza.webp'),
  ...pictures,
  ...Array.from({length:12},(_,i)=>publicAssetPath(`mascots/gogo/stage-${String(i+1).padStart(2,'0')}.webp`)),
  ...Object.keys(manifest).map(name=>publicAssetPath(`mascots/gogo/${name}.webp`)),
 ])]);
 const sources=useMemo(()=>JSON.parse(key) as string[],[key]);
 const saved=useRef(new Map<string,Artwork>()),callback=useRef(onReady);callback.current=onReady;
 const [loaded,setLoaded]=useState(0),[readyKey,setReadyKey]=useState('');
 useEffect(()=>()=>{for(const asset of saved.current.values())URL.revokeObjectURL(asset.url);saved.current.clear()},[]);
 useEffect(()=>{
  let alive=true,index=0;const controllers=new Set<AbortController>();
  setReadyKey('');setLoaded(sources.filter(src=>saved.current.has(src)).length);
  const startTimer=setTimeout(()=>setReadyKey(key),practiceStartDelayMs);
  async function worker(){
   while(alive&&index<sources.length){
    const src=sources[index++];if(saved.current.has(src))continue;
    const controller=new AbortController();controllers.add(controller);
    const timeout=setTimeout(()=>controller.abort(),12000);
    try{
     const cancelled=new Promise<never>((_,reject)=>controller.signal.addEventListener('abort',()=>reject(Error('Artwork loading stopped')),{once:true}));
     const blob=await Promise.race([download(src,controller.signal),cancelled]);
     if(!alive)return;
     saved.current.set(src,{blob,url:URL.createObjectURL(blob)});
    }catch{/* An unavailable picture must not stop the question or the other downloads. */}
    finally{clearTimeout(timeout);controllers.delete(controller);if(alive)setLoaded(n=>n+1)}
   }
  }
  // A few parallel downloads keep mobile connections responsive.
  void Promise.all(Array.from({length:3},worker)).then(()=>{
   clearTimeout(startTimer);
   if(alive)setReadyKey(key);
  });
  return()=>{alive=false;clearTimeout(startTimer);for(const controller of controllers)controller.abort()};
 },[sources,key]);
 const ready=readyKey===key;
 useEffect(()=>{callback.current(ready);return()=>{if(ready)callback.current(false)}},[key,ready]);
 if(!ready)return <section className="panel gogo-loading" aria-label="Loading Feed Gogo">
  <span className="gogo-loading-icon" aria-hidden="true">🍽️</span>
  <h2>Getting Gogo ready… 咕咕准备中…</h2>
  <progress max={sources.length} value={loaded} aria-label="Artwork download progress"/>
  <p role="status" aria-live="polite">{loaded} / {sources.length} · {Math.round(loaded/sources.length*100)}%</p>
  <p>Pictures and animations can keep loading while you play. 游戏时会继续加载图片和动画。</p>
  <button className="primary" onClick={()=>setReadyKey(key)}>Start now 开始练习</button>
  <button onClick={onExit}>Dashboard 主页</button>
 </section>;
 return <ArtworkContext.Provider value={saved.current}>{children}</ArtworkContext.Provider>;
}

import {createContext,useContext,useEffect,useMemo,useRef,useState,type ImgHTMLAttributes,type ReactNode} from 'react';
import {publicAsset} from '../lib/public-runtime';
import manifest from '../public/mascots/gogo/manifest.json';

type Artwork={blob:Blob;url:string};
const ArtworkContext=createContext<ReadonlyMap<string,Artwork>>(new Map());
// Bump this namespace when replacing the artwork, so old copies cannot win.
const CACHE='wordquest-gogo-art-v1';
export function useGogoArtwork(){return useContext(ArtworkContext)}
export function GogoImage({src,...props}:Omit<ImgHTMLAttributes<HTMLImageElement>,'src'>&{src?:string}){const artwork=useGogoArtwork();return <img {...props} src={src?artwork.get(src)?.url||src:undefined}/>}

async function download(src:string,signal:AbortSignal,refresh:boolean):Promise<Blob>{
 let cache:Cache|undefined;
 const mascot=src.startsWith(publicAsset('mascots/gogo/'));
 if(mascot)try{cache=await caches.open(CACHE)}catch{/* Private browsers can still use memory and HTTP caching. */}
 const key=new URL(src,document.baseURI).href;
 if(!refresh)try{const saved=await cache?.match(key);if(saved?.ok)return await saved.blob()}catch{}
 // Lesson pictures still revalidate on entry so a teacher's replacement is seen.
 const response=await fetch(src,{cache:refresh?'reload':mascot?'force-cache':'no-cache',signal});
 if(!response.ok)throw Error('Artwork download failed');
 const copy=response.clone();const blob=await response.blob();
 try{await cache?.put(key,copy)}catch{/* Storage limits must not prevent playing this session. */}
 return blob;
}
async function decode(url:string,signal:AbortSignal){
 const image=new Image();
 await new Promise<void>((resolve,reject)=>{
  const clean=()=>{image.onload=null;image.onerror=null;signal.removeEventListener('abort',abort)};
  const abort=()=>{clean();image.src='';reject(Error('Loading cancelled'))};
  image.onload=()=>{clean();resolve()};image.onerror=()=>{clean();reject(Error('Artwork could not be opened'))};
  signal.addEventListener('abort',abort,{once:true});if(signal.aborted){abort();return}image.src=url;
 });
}

export default function GogoAssets({pictures,children,onReady,onExit}:{pictures:string[];children:ReactNode;onReady:(ready:boolean)=>void;onExit:()=>void}){
 const key=JSON.stringify([...new Set([
  ...Array.from({length:12},(_,i)=>publicAsset(`mascots/gogo/stage-${String(i+1).padStart(2,'0')}.webp`)),
  ...Object.keys(manifest).map(name=>publicAsset(`mascots/gogo/${name}.webp`)),...pictures,
 ])].sort());
 const sources=useMemo(()=>JSON.parse(key) as string[],[key]);
 const saved=useRef(new Map<string,Artwork>()),callback=useRef(onReady);callback.current=onReady;
 const [loaded,setLoaded]=useState(0),[ready,setReady]=useState(false),[error,setError]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>()=>{for(const asset of saved.current.values())URL.revokeObjectURL(asset.url);saved.current.clear()},[]);
 useEffect(()=>{
  let alive=true,index=0,failed=false;const controllers=new Set<AbortController>();
  setReady(false);setError(false);callback.current(false);setLoaded(sources.filter(src=>saved.current.has(src)).length);
  async function worker(){
   while(alive&&!failed&&index<sources.length){
    const src=sources[index++];if(saved.current.has(src))continue;
    const controller=new AbortController();controllers.add(controller);
    const timer=setTimeout(()=>controller.abort(),30000);let url='';
    try{
     const blob=await download(src,controller.signal,retry>0);if(!alive)return;
     url=URL.createObjectURL(blob);await decode(url,controller.signal);
     if(!alive){URL.revokeObjectURL(url);return}
     saved.current.set(src,{blob,url});url='';setLoaded(n=>n+1);
    }catch{if(alive)failed=true;if(url)URL.revokeObjectURL(url)}
    finally{clearTimeout(timer);controllers.delete(controller)}
   }
  }
  // A few parallel downloads keep mobile connections responsive.
  void Promise.all(Array.from({length:3},worker)).then(()=>{
   if(!alive)return;
   if(failed){setError(true);return}
   setReady(true);callback.current(true);
  });
  return()=>{alive=false;for(const controller of controllers)controller.abort()};
 },[sources,retry]);
 if(!ready)return <section className="panel gogo-loading" aria-label="Loading Feed Gogo">
  <span className="gogo-loading-icon" aria-hidden="true">🍽️</span>
  <h2>{error?'Let’s try loading again 再试一次':'Getting Gogo ready… 咕咕准备中…'}</h2>
  <progress max={sources.length} value={loaded} aria-label="Artwork download progress"/>
  <p role="status" aria-live="polite">{loaded} / {sources.length} · {Math.round(loaded/sources.length*100)}%</p>
  <p>{error?'Some pictures could not load. Check your connection, then try again. 部分图片未能加载，请检查网络后重试。':'Downloading all pictures and animations before we play. 开始前先加载全部图片和动画。'}</p>
  {error&&<button className="primary" onClick={()=>setRetry(n=>n+1)}>Try again 重试</button>}
  <button onClick={onExit}>Dashboard 主页</button>
 </section>;
 return <ArtworkContext.Provider value={saved.current}>{children}</ArtworkContext.Provider>;
}

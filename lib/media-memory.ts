// Keep complete compressed files in memory so image/audio playback needs no second request.
// Active lessons are pinned; unused files are evicted first when the cache grows.
type Asset={url:string;bytes:number;users:Set<symbol>;used:number};
const assets=new Map<string,Asset>();
const idleBudget=32*1024*1024;
export function preloadedMediaUrl(source:string){return assets.get(source)?.url||source}
export function retainMedia(source:string,user:symbol){const asset=assets.get(source);if(!asset)return false;asset.users.add(user);asset.used=Date.now();return true}
export function rememberMedia(source:string,blob:Blob,user:symbol){
 const existing=assets.get(source);if(existing){existing.users.add(user);existing.used=Date.now();return}
 assets.set(source,{url:URL.createObjectURL(blob),bytes:blob.size,users:new Set([user]),used:Date.now()});
}
export function releaseMedia(user:symbol){
 for(const asset of assets.values())asset.users.delete(user);
 let bytes=[...assets.values()].reduce((n,a)=>n+a.bytes,0);
 for(const [source,asset] of [...assets.entries()].filter(([,a])=>!a.users.size).sort((a,b)=>a[1].used-b[1].used)){
  if(bytes<=idleBudget)break;
  URL.revokeObjectURL(asset.url);assets.delete(source);bytes-=asset.bytes;
 }
}

import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {classroomRequest,sessionSaved} from '../lib/classroom-client';
type FileLink={url:string;expiresAt:number};
async function prepare(image:string,filename:string):Promise<FileLink>{const session=sessionSaved();if(!session||session.role!=='teacher')throw Error('Please sign in as a teacher to save QR codes.');return classroomRequest(session.endpoint,'/qr-download',{image,filename},session)}
export default function QRDownload({image,filename='student-homework-qr.png',className,children,prepareFile=prepare}:{image:string;filename?:string;className?:string;children:ReactNode;prepareFile?:(image:string,filename:string)=>Promise<FileLink>}){
 const target='qr-file-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const [file,setFile]=useState<(FileLink&{source:string})|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);const request=useRef(prepareFile);request.current=prepareFile;
 useEffect(()=>{let active=true,timer:ReturnType<typeof setTimeout>;setFile(null);setError('');if(!image.startsWith('data:image/png;base64,'))return;
 void request.current(image,filename).then(f=>{if(!active)return;const url=new URL(f.url);if(url.protocol!=='https:'&&!(['localhost','127.0.0.1'].includes(url.hostname)&&url.protocol==='http:'))throw Error('Could not prepare a secure QR download.');setFile({...f,source:image});timer=setTimeout(()=>setRetry(n=>n+1),Math.max(1000,f.expiresAt-Date.now()-60000))}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Could not prepare download. Please retry.')});
 return()=>{active=false;clearTimeout(timer)};
 },[image,filename,retry]);
 if(error)return <span className="qr-download-error"><span role="alert">{error}</span><button type="button" onClick={()=>setRetry(n=>n+1)}>Retry download 重试下载</button></span>;
 if(!file||file.source!==image)return <button type="button" disabled className={className}>Preparing download… 准备下载…</button>;
 // The server sends Content-Disposition: attachment. Never navigate to image data or blob URLs.
 return <><a className={className} href={file.url} download={filename} target={target} referrerPolicy="no-referrer" onClick={e=>{if(file.expiresAt<=Date.now()){e.preventDefault();setRetry(n=>n+1)}}}>{children}</a><iframe name={target} title="QR file download" hidden aria-hidden="true" referrerPolicy="no-referrer"/></>;
}

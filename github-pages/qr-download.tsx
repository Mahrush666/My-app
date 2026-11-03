import {useEffect,useState,type ReactNode} from 'react';

// A real file URL is more reliable than downloading a canvas data URL in Safari.
// Keep the app in its own tab even if an embedded browser previews the PNG.
export default function QRDownload({image,filename='student-homework-qr.png',className,children}:{image:string;filename?:string;className?:string;children:ReactNode}){
 const [file,setFile]=useState<{source:string;url:string}|null>(null);
 useEffect(()=>{
  if(!image.startsWith('data:image/png;base64,')){setFile(null);return}
  const bytes=Uint8Array.from(atob(image.slice(image.indexOf(',')+1)),c=>c.charCodeAt(0));
  const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
  setFile({source:image,url});
  // Browsers may read the file after the modal closes. Do not revoke it mid-save.
  return()=>{window.setTimeout(()=>URL.revokeObjectURL(url),60000)};
 },[image]);
 if(file?.source!==image)return <button type="button" disabled className={className}>{children}</button>;
 return <a className={className} href={file.url} download={filename} target="_blank" rel="noopener noreferrer">{children}</a>;
}

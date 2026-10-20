import QRCode from 'qrcode';
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
// All personal student QR codes use this template. Keep the URL private and unchanged.
export function studentQrSvg(url:string,name:string){
 const qr=QRCode.create(url,{errorCorrectionLevel:'H'}),n=qr.modules.size,size=n+8;
 const clean=name.replace(/[\u0000-\u001f\u007f]/g,' ').trim()||'Student';
 const chars=Array.from(clean),label=chars.length>9?chars.slice(0,8).join('')+'…':clean;
 const lines:string[]=[];for(let i=0;i<chars.length;i+=24)lines.push(chars.slice(i,i+24).join(''));
 const height=size+lines.length*4+4;
 let path='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.modules.get(y,x))path+=`M${x+4} ${y+4}h1v1h-1z`;
 const width=Math.min(11,n*.2),badgeHeight=3.6,cx=size/2,cy=size/2;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${Math.round(960*height/size)}" viewBox="0 0 ${size} ${height}"><rect width="100%" height="100%" fill="white"/><path d="${path}" fill="#151515" shape-rendering="crispEdges"/><rect x="${cx-width/2}" y="${cy-badgeHeight/2}" width="${width}" height="${badgeHeight}" rx=".5" fill="white"/><text x="${cx}" y="${cy+.55}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.min(1.8,(width-1)/Array.from(label).length)}" fill="#25213d">${escape(label)}</text>${lines.map((line,i)=>`<text x="${cx}" y="${size+3+i*4}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.min(3,(size-8)/Array.from(line).length)}" fill="#25213d">${escape(line)}</text>`).join('')}</svg>`;
}
export async function studentQrDataUrl(url:string,name:string){
 const svg=studentQrSvg(url,name),image=new Image();
 const objectUrl=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Could not create student QR. Please try again.'));image.src=objectUrl});
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Could not create student QR.');ctx.drawImage(image,0,0);return canvas.toDataURL('image/png');
 }finally{URL.revokeObjectURL(objectUrl)}
}

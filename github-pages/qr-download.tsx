import {useId,type ReactNode} from 'react';

// Keep the PNG self-contained: blob URLs cannot be handed to another browser.
// A named frame protects the teacher page if a browser ignores `download`.
export default function QRDownload({image,filename='student-homework-qr.png',className,children}:{image:string;filename?:string;className?:string;children:ReactNode}){
 const target='qr-save-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 if(!image.startsWith('data:image/png;base64,'))return <button type="button" disabled className={className}>{children}</button>;
 return <><a className={className} href={image} download={filename} target={target}>{children}</a><iframe name={target} title="QR file download" hidden aria-hidden="true"/></>;
}

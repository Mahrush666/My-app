/** Accept both new scanner-compatible links and existing fragment links. */
export function studentAccess(url:URL){return url.searchParams.get('homework')||new URLSearchParams(url.hash.slice(1)).get('access')||''}
export function studentHomeworkLink(base:string,access:string){const url=new URL(base);url.search='';url.searchParams.set('v','20261012-qr-fix');url.searchParams.set('homework',access);url.hash='view=classroom';return url.href}

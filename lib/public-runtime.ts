declare const __WORDQUEST_BASE__: string;
declare const __WORDQUEST_STATIC__: boolean;
export const staticPreview = typeof __WORDQUEST_STATIC__ !== 'undefined' && __WORDQUEST_STATIC__;
export function publicAsset(path: string) {
  const base = typeof __WORDQUEST_BASE__ === 'undefined' ? '/' : __WORDQUEST_BASE__;
  return base + path.replace(/^\//, '');
}

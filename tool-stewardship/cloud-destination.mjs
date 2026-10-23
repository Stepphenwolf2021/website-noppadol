export const CLOUD_DOMAIN='https://tools.noppadol.online';
export const HOSTED_FALLBACK='https://private-tool-cabinet-noppadol.steppenwolff.chatgpt.site';
// Activate only after DNS and HTTPS verification, using this same Site/database.
export const CUSTOM_DOMAIN_ACTIVE=true;
export const CLOUD_ORIGIN=CUSTOM_DOMAIN_ACTIVE?CLOUD_DOMAIN:HOSTED_FALLBACK;
export function destination(page,search='',hash=''){const url=new URL('/tool-stewardship/'+(page==='graph'?'knowledge-graph.html':'index.html'),CLOUD_ORIGIN),params=new URLSearchParams(search);for(const key of ['record','node','scope'])if(params.has(key))url.searchParams.set(key,params.get(key));if(hash)url.hash=hash;return url.href;}

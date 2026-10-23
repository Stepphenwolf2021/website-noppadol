import {safeURL,libraryLabels} from './catalog.mjs?v=1.5.0';
export function nodeImage(n){return (n.type==='asset'?n.data?.catalogReference?.imageURLs:n.type==='model'?n.data?.imageURLs:null)?.find(safeURL)||null;}
// The projection bounds drawing cost, never the source graph, query matches, or export.
export function constellationProjection(view,{selected=null,limit=36}={}){
 const byID=new Map(view.nodes.map(n=>[n.id,n]));
 if(selected&&byID.has(selected)){
  const connected=view.edges.filter(e=>e.from===selected||e.to===selected),ids=new Set([selected]);
  for(const e of connected.slice(0,24)){ids.add(e.from);ids.add(e.to);}
  return {nodes:view.nodes.filter(n=>ids.has(n.id)),edges:connected.filter(e=>ids.has(e.from)&&ids.has(e.to)),roots:view.roots.filter(n=>ids.has(n.id)),omitted:view.nodes.length-ids.size,focused:true};
 }
 const buckets=new Map();for(const n of view.roots){const group=n.type==='model'?n.data.category:(n.data.observations?.find(o=>o.field==='common.brand')?.originalValue||libraryLabels[n.data.libraryStatus||'owned']);if(!buckets.has(group))buckets.set(group,[]);buckets.get(group).push(n);}
 const roots=[];for(let i=0;roots.length<limit;i++){let added=false;for(const b of buckets.values())if(b[i]&&roots.length<limit){roots.push(b[i]);added=true;}if(!added)break;}
 const ids=new Set(roots.map(n=>n.id));for(const e of view.edges)if(ids.has(e.from)||ids.has(e.to)){if(!view.roots.some(n=>n.id===(ids.has(e.from)?e.to:e.from))){ids.add(e.from);ids.add(e.to);}}
 const nodes=view.nodes.filter(n=>ids.has(n.id));return {nodes,edges:view.edges.filter(e=>ids.has(e.from)&&ids.has(e.to)),roots,omitted:view.nodes.length-nodes.length,focused:false};
}
export function constellationPositions(projection,{selected=null}={}){
 const positions=new Map(),clusters=[],{nodes,roots}=projection;
 if(selected&&nodes.some(n=>n.id===selected)){
  positions.set(selected,{x:500,y:345});const others=nodes.filter(n=>n.id!==selected);others.forEach((n,i)=>{const a=2*Math.PI*i/Math.max(1,others.length)-Math.PI/2,r=others.length>14?260:245;positions.set(n.id,{x:500+Math.cos(a)*r*1.48,y:345+Math.sin(a)*r});});return {positions,clusters};
 }
 const buckets=new Map();for(const n of roots){const key=n.type==='model'?n.data.category:(n.data.observations?.find(o=>o.field==='common.brand')?.originalValue||libraryLabels[n.data.libraryStatus||'owned']);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(n);}
 const cols=buckets.size>9?4:buckets.size>4?3:2,rows=Math.max(1,Math.ceil(buckets.size/cols)),top=100,height=560;
 [...buckets].forEach(([key,bucket],i)=>{const x=(i%cols+.5)*1000/cols,y=top+(Math.floor(i/cols)+.5)*height/rows,rx=1000/cols*.43,ry=Math.min(115,height/rows*.43);clusters.push({key,x,y,rx,ry});
 const hub=nodes.find(n=>n.id==='category:'+key);if(hub)positions.set(hub.id,{x,y});
 bucket.forEach((n,j)=>{const a=2*Math.PI*j/Math.max(1,bucket.length)-Math.PI/2;positions.set(n.id,{x:x+Math.cos(a)*rx*.72,y:y+Math.sin(a)*ry*.68});});});
 const providers=nodes.filter(n=>n.type==='provider');providers.forEach((n,i)=>positions.set(n.id,{x:(i+1)*1000/(providers.length+1),y:40}));
 const extras=nodes.filter(n=>!positions.has(n.id));extras.forEach((n,i)=>{const linked=projection.edges.find(e=>e.from===n.id&&positions.has(e.to))||projection.edges.find(e=>e.to===n.id&&positions.has(e.from));const base=linked&&positions.get(linked.from===n.id?linked.to:linked.from);const a=i*2.399963;positions.set(n.id,{x:Math.max(35,Math.min(965,(base?.x||500)+Math.cos(a)*50)),y:Math.max(80,Math.min(675,(base?.y||345)+Math.sin(a)*46))});});return {positions,clusters};
}

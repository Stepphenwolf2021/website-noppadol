const data=JSON.parse(document.querySelector('#model-data').textContent);
const svg=document.querySelector('#model'),ns='http://www.w3.org/2000/svg',nodes=new Map(data.nodes.map(n=>[n.id,n]));
const el=(tag,attrs)=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
const defs=el('defs',{}),marker=el('marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'});
marker.append(el('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:'#697784'}));defs.append(marker);svg.append(defs);
for(const edge of data.edges){const a=nodes.get(edge.source),b=nodes.get(edge.target),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),offset=82;
const group=el('g',{class:'model-edge',tabindex:0,role:'button','aria-label':edge.source+' '+edge.predicate+' '+edge.target});
const line=el('line',{x1:a.x+dx/len*offset,y1:a.y+dy/len*29,x2:b.x-dx/len*offset,y2:b.y-dy/len*29,'marker-end':'url(#arrow)'});
const label=el('text',{x:(a.x+b.x)/2,y:(a.y+b.y)/2-9,'text-anchor':'middle'});label.textContent=edge.predicate;group.append(line,label);
const select=()=>{document.querySelector('#model-detail').textContent=edge.source+' → '+edge.predicate+' → '+edge.target+' · '+edge.note;svg.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));group.classList.add('selected');};group.addEventListener('click',select);group.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select();}});svg.append(group);}
for(const node of data.nodes){const g=el('g',{class:'model-node'});g.append(el('rect',{x:node.x-88,y:node.y-31,width:176,height:62,rx:8}));const t=el('text',{x:node.x,y:node.y-3,'text-anchor':'middle'});t.textContent=node.label;const sub=el('text',{x:node.x,y:node.y+18,'text-anchor':'middle',class:'model-th'});sub.textContent=node.th;g.append(t,sub);svg.append(g);}

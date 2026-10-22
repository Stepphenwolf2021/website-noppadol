import {categoryLabels,providerLabels,providerKey,libraryLabels} from './catalog.mjs?v=1.3.0';
import {graph,validate} from './model.mjs?v=1.3.0';
export const nodeTypes={provider:['แหล่งแค็ตตาล็อก','#816348'],category:['หมวดเครื่องมือ','#536b4c'],model:['รุ่นเครื่องมือ','#8d9d7c'],asset:['รายการส่วนตัว','#365e5c'],source:['หลักฐานต้นทาง','#bb9d72'],passport:['บันทึกดูแล / ส่งต่อ','#9f7861'],value:['ค่าที่บันทึก','#b6a2ba'],condition:['สภาพล่าสุด','#8a9560'],valuation:['การประเมิน','#b48b49'],plan:['แผนส่งต่อ','#ad7468']};
export function catalogNetwork(c){
 const nodes=new Map(),edges=[];const add=n=>nodes.set(n.id,n);
 for(const m of c.models){const p=providerKey(m),pid='provider:'+p,cid='category:'+m.category;add({id:pid,label:providerLabels[p],type:'provider'});add({id:cid,label:categoryLabels[m.category],type:'category'});add({id:m.id,label:m.name,type:'model',data:m,search:[m.sku,m.brand,m.seller,m.sourceProductId].join(' ')});edges.push({from:m.id,to:pid,label:'แหล่งแค็ตตาล็อก'},{from:m.id,to:cid,label:'จัดอยู่ในหมวด'});}
 return {nodes:[...nodes.values()],edges};
}
export function personalNetwork(db){
 validate(db);const original=graph(db),nodes=new Map(),edges=[];const records=new Map(db.records.map(r=>['urn:noppadol:asset:'+r.id,r]));
 const types={'a:ProductModel':'model','prov:Entity':'source','s:ToolPassport':'passport','s:LibrarySelection':'passport','s:ConditionAssessment':'condition','s:Valuation':'valuation','s:TransferPlan':'plan'};
 const predicates={'prov:wasDerivedFrom':'อ้างอิงหลักฐาน','s:describesAsset':'บันทึกของชิ้น','s:selectsModel':'บันทึกการเลือกรุ่น','s:catalogEntry':'อ้างรุ่นแค็ตตาล็อก','a:model':'เป็นชิ้นของรุ่นที่ระบุ','s:hasAssessment':'มีการตรวจสภาพ','s:hasValuation':'มีการประเมิน','s:hasTransferPlan':'มีแผนส่งต่อ'};
 for(const n of original['@graph']){const r=records.get(n['@id']);nodes.set(n['@id'],{id:n['@id'],label:r?`${r.id} · ${r.title.replace(/^\d+-/,'')}`:n.sourceUUID?'ต้นฉบับ '+n.sourceUUID.slice(0,8):n.description||n.intent||n.purpose||n.label||n['@type'],type:r?'asset':types[n['@type']]||'value',data:r||n,search:r?[r.sourceText,libraryLabels[r.libraryStatus||'owned']].join(' '):''});for(const [k,v]of Object.entries(n)){if(predicates[k]&&v?.['@id'])edges.push({from:n['@id'],to:v['@id'],label:predicates[k]});}}
 const fields={'common.brand':'ยี่ห้อที่บันทึก','common.maker':'ผู้สร้างที่บันทึก','common.manufacture_country':'ประเทศผลิตที่บันทึก','hand_plane.body_material':'วัสดุที่บันทึก'};
 for(const r of db.records)for(const o of r.observations){if(!fields[o.field])continue;const id='observation:'+JSON.stringify([o.field,o.originalValue]);nodes.set(id,{id,label:o.originalValue,type:'value',data:{field:o.field,value:o.originalValue,status:o.status}});edges.push({from:'urn:noppadol:asset:'+r.id,to:id,label:fields[o.field],evidence:{sourceUUID:r.source.uuid,revision:o.sourceRevision,startLine:o.startLine,endLine:o.endLine,status:o.status}});}
 return {nodes:[...nodes.values()],edges};
}
export function selectNetwork(network,{query='',group='',provider='',scope='catalog'}={}){
 const q=query.trim().toLocaleLowerCase();const roots=network.nodes.filter(n=>n.type===(scope==='catalog'?'model':'asset')&&(!q||[n.label,n.search].join(' ').toLocaleLowerCase().includes(q))&&(!group||(scope==='catalog'?n.data.category===group:(n.data.libraryStatus||'owned')===group))&&(!provider||scope!=='catalog'||providerKey(n.data)===provider));
 const rootIDs=new Set(roots.map(n=>n.id)),ids=new Set(rootIDs);for(const e of network.edges)if(rootIDs.has(e.from)||rootIDs.has(e.to)){ids.add(e.from);ids.add(e.to);} const passports=new Set(network.nodes.filter(n=>n.type==='passport'&&ids.has(n.id)).map(n=>n.id));for(const e of network.edges)if(passports.has(e.from)||passports.has(e.to)){ids.add(e.from);ids.add(e.to);}
 return {roots,nodes:network.nodes.filter(n=>ids.has(n.id)),edges:network.edges.filter(e=>ids.has(e.from)&&ids.has(e.to))};
}
export function neighbours(network,id){return network.edges.filter(e=>e.from===id||e.to===id);}

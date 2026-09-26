import {domains} from './domains.js';
export const VERSION = 1;
export const NS = {a:'urn:noppadol:assets:ontology:',b:'urn:noppadol:assets:bridge:',n:'urn:noppadol:ontology:',f:'urn:noppadol:assets:field:',xsd:'http://www.w3.org/2001/XMLSchema#'};
export const kinds = {AssetItem:'ทรัพย์สินรายชิ้น',Component:'ส่วนประกอบ',ProductModel:'รุ่นผลิตภัณฑ์',ReleaseEdition:'ฉบับแผ่นเสียง',ReleaseGroup:'กลุ่มฉบับแผ่นเสียง',BrandRecord:'แบรนด์',AgentRecord:'บุคคล / องค์กร',TrackEntry:'แทร็ก',AssetEvent:'บันทึกการใช้ / ดูแล'};
export const profiles = {generic:'ทั่วไป',hand_plane:'กบไสไม้',chisel:'สิ่ว',camera:'กล้อง / เลนส์',record_disc:'แผ่นเสียง',component:'ส่วนประกอบ'};
export const bases = {owner_reported:'บันทึกโดยเจ้าของ',measured:'วัดด้วยตนเอง',manufacturer_spec:'ข้อมูลผู้ผลิต',seller_reported:'ข้อมูลผู้ขาย',external_database:'ฐานข้อมูลภายนอก',inferred:'ข้ออนุมาน'};
export const events={acquisition:'การได้มา',use:'การใช้งาน',maintenance:'การดูแล',repair:'การซ่อม',listening:'การฟัง',component_change:'เปลี่ยนส่วนประกอบ'};
export const emptyDB = () => ({version:VERSION,records:[],ideas:[]});
export const id = () => 'urn:noppadol:assets:local:'+crypto.randomUUID();
const filled = x => typeof x === 'string' && x.trim().length > 0;
const dateOK = x => typeof x==='string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(x) && Number.isFinite(Date.parse(x)) && new Date(x).toISOString().replace('.000Z','Z')===x.replace('.000Z','Z');
const urlOK = s => {try {return ['http:','https:'].includes(new URL(s).protocol);}catch{return false;}};
export function validateDB(db, catalog, vocabulary) {
 const errors=[]; const fail=s=>errors.push(s);
 if (!db || db.version!==VERSION || !Array.isArray(db.records) || !Array.isArray(db.ideas)) return ['รูปแบบไฟล์สำรองหรือเวอร์ชันไม่ถูกต้อง'];
 if(db.records.length+db.ideas.length>2000)return ['รองรับสูงสุด 2,000 รายการต่อไฟล์'];
 const entities=[...db.records,...db.ideas];const allIDs=new Set();
 for(const r of entities){
  if(!r || !/^urn:noppadol:assets:local:[0-9a-f-]{36}$/.test(r.id||'')) {fail('รหัสรายการไม่ถูกต้อง');continue;}
  if(allIDs.has(r.id))fail('รหัสรายการซ้ำ');allIDs.add(r.id);
  if(!filled(r.title)||!filled(r.creator)||!dateOK(r.createdAt)||!dateOK(r.updatedAt)) fail('ต้องมีชื่อ ผู้บันทึก และวันที่ที่ถูกต้อง');
  if(!filled(r.sourceText))fail('ต้องมีบันทึกต้นทางสำหรับข้อมูลหรือไอเดีย');
  if(r.sourceURL && !urlOK(r.sourceURL))fail('ลิงก์ต้นทางต้องเป็น http หรือ https');
 }
 const fields=new Map(catalog.profiles.flatMap(p=>p.fields.map(f=>[`${p.id}.${f.id}`,f])));
 const concepts=new Set(vocabulary.concepts.map(c=>c.uri));
 const get=id=>db.records.find(r=>r?.id===id);
 for(const r of db.records){
  if(!r || !Object.hasOwn(kinds,r.kind)||!Object.hasOwn(profiles,r.profile)) {fail('ชนิดรายการหรือแบบข้อมูลไม่รองรับ');continue;}
  if(r.domain!==undefined&&!Object.hasOwn(domains,r.domain))fail('ชื่อแอปไม่ถูกต้อง');
  if(domains[r.domain]&&(!domains[r.domain].profiles.includes(r.profile)||!domains[r.domain].kinds.includes(r.kind)))fail('ระดับรายการหรือแบบรายละเอียดไม่ตรงกับแอปที่เลือก');
  if(!Array.isArray(r.concepts)||r.concepts.some(c=>!concepts.has(c))) fail('คำศัพท์ต้องมาจาก Controlled Vocabulary');
  if(!Array.isArray(r.observations)){fail('ข้อมูลคุณสมบัติผิดรูปแบบ');continue;}
  const seen=new Set();
  for(const o of r.observations){
   if(!o||!fields.has(o.field)){fail('ไม่พบฟิลด์ใน Metadata Standard');continue;}
   if(seen.has(o.field))fail('ฟิลด์ซ้ำในรายการเดียวกัน');seen.add(o.field);
   if(!(o.field.startsWith('common.')||o.field.startsWith(r.profile+'.')))fail('ฟิลด์ไม่ตรงกับแบบข้อมูล');
   if(!['known','unknown','not_applicable'].includes(o.status))fail('สถานะค่าไม่ถูกต้อง');
   if(o.status!=='known'){if(o.value!==''||o.unit!=='')fail('ยังไม่ทราบ / ไม่เกี่ยวข้อง ต้องไม่มีค่า');continue;}
   if(!Object.hasOwn(bases,o.basis)||!filled(o.value))fail('ค่าที่ทราบต้องมีค่าและวิธีได้ข้อมูล');
   if(!['text','number','reference'].includes(o.type))fail('ชนิดค่าไม่รองรับ');
   if(o.type==='number' && (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(o.value)||!Number.isFinite(Number(o.value))||!filled(o.unit)))fail('ค่าตัวเลขต้องเป็นเลขฐานสิบและมีหน่วย');
   if(o.type==='reference'&&!get(o.value))fail('ค่าอ้างอิงต้องเป็นรายการที่บันทึกไว้แล้ว');
  }
  for(const [key,allowed] of Object.entries({model:['ProductModel'],edition:['ReleaseEdition'],releaseGroup:['ReleaseGroup'],inEdition:['ReleaseEdition']})){
   if(r[key]&&!allowed.includes(get(r[key])?.kind))fail('ปลายทาง '+key+' ไม่ถูกชนิด');
  }
  const item=['AssetItem','Component'].includes(r.kind);
  if(r.kind==='AssetEvent'&&(!Object.hasOwn(events,r.eventKind)||!['AssetItem','Component'].includes(get(r.participant)?.kind)))fail('บันทึกการใช้ต้องระบุกิจกรรมและทรัพย์สิน');
  if(r.eventDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(r.eventDate)||!Number.isFinite(Date.parse(r.eventDate))||new Date(r.eventDate).toISOString().slice(0,10)!==r.eventDate))fail('วันที่กิจกรรมไม่ถูกต้อง');
  if(r.parent&&(r.kind!=='Component'||r.parent===r.id||!['AssetItem','Component'].includes(get(r.parent)?.kind)))fail('ส่วนประกอบต้องเชื่อมกับทรัพย์สินอื่นที่มีอยู่');
  if((r.model||r.edition)&&!item)fail('รุ่น/ฉบับต้องผูกกับทรัพย์สินรายชิ้น');
  if(r.releaseGroup&&r.kind!=='ReleaseEdition')fail('กลุ่มฉบับต้องผูกกับฉบับเผยแพร่');
  if(r.kind==='TrackEntry'&&!r.inEdition)fail('แทร็กต้องระบุฉบับ');
  if(r.inEdition&&r.kind!=='TrackEntry')fail('รายการนี้ไม่ใช่แทร็ก');
 }
 for(const r of db.ideas){
  if(!r||!filled(r.mission)||!filled(r.rationale)||!filled(r.limits)||!Array.isArray(r.assets)||!r.assets.length) {fail('ไอเดียต้องมี Mission เหตุผล ข้อจำกัด และทรัพย์สิน');continue;}
  if(new Set(r.assets).size!==r.assets.length)fail('ทรัพย์สินในไอเดียซ้ำ');
  if(r.assets.some(x=>!['AssetItem','Component'].includes(get(x)?.kind)))fail('ไอเดียต้องเชื่อมทรัพย์สินรายชิ้นที่มีอยู่');
 }
 return [...new Set(errors)];
}
const iri=x=>({'@id':x});const literal=(x,type)=>({'@value':x,'@type':'xsd:'+type});
export async function exportGraph(db,catalog,vocabulary){
 const errors=validateDB(db,catalog,vocabulary);if(errors.length)throw new Error(errors.join('\n'));
 const nodes=[]; const add=x=>(nodes.push(x),x);
 const managed=(r,uri,type,title=r.title)=>add({'@id':uri,'@type':type,'n:title':title,'n:audience':'owner','n:publication':'draft','n:reviewStatus':'unreviewed','n:rightsStatus':'unknown','n:createdBy':r.creator,'n:createdAt':literal(r.createdAt,'dateTime')});
 async function source(r){
  const bytes=new TextEncoder().encode(r.sourceText);const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const input=managed(r,r.id+':source','n:KnowledgeInput','บันทึกต้นทาง: '+r.title);
  const revision=r.id+':revision:'+hash;input['n:hasRevision']=iri(revision);
  if(r.sourceURL)input['n:description']='ลิงก์อ้างอิงที่ผู้บันทึกระบุ: '+r.sourceURL;
  // Embed exact UTF-8 text so the graph has a retrievable, hash-verifiable source.
  let raw='';for(const b of bytes)raw+=String.fromCharCode(b);
  add({'@id':revision,'@type':'n:TextSnapshot','n:sha256':hash,'n:storageRef':'data:text/plain;charset=utf-8;base64,'+btoa(raw)});
  const locator=revision+':locator';add({'@id':locator,'@type':'n:TextLocator','n:paragraphIndex':literal(0,'integer'),'n:start':literal(0,'integer'),'n:end':literal([...r.sourceText].length,'integer')});
  const ev=managed(r,r.id+':evidence','n:Evidence');Object.assign(ev,{'n:sourceInput':iri(input['@id']),'n:sourceRevision':iri(revision),'n:locator':iri(locator),'n:description':'ข้อความต้นทางที่ผู้ใช้บันทึกเอง ไม่ใช่การยืนยันจากเว็บไซต์ภายนอก','n:origin':'source'});
  return {input:input['@id'],evidence:ev['@id']};
 }
 function connection(r,s,o,p,k,ev,suffix){
  const c=managed(r,r.id+':connection:'+suffix,'b:AssetConnection');const link=c['@id']+':link';
  add({'@id':link,'@type':'n:EvidenceLink','n:evidence':iri(ev),'n:role':k==='creative_proposal'?'context':'supports'});
  Object.assign(c,{'b:subject':iri(s),'b:object':iri(o),'b:predicate':iri(NS.b+p),'b:evidenceLink':iri(link),'n:relationKind':k,'n:rationale':r.rationale||'บันทึกต้นทางอธิบายรายการนี้ตามการกรอกของผู้ใช้','n:method':'บันทึกโดยผู้ใช้ใน Asset Studio','n:limits':r.limits||'ยังไม่ผ่านการทบทวน ไม่ยืนยันกรรมสิทธิ์หรือความถูกต้องของต้นทางภายนอก'});
 }
 for(const r of db.records){
  const node=managed(r,r.id,'a:'+r.kind);const s=await source(r);
  if(['AssetItem','Component'].includes(r.kind)){
   node['a:profile']=r.profile;node['a:classifiedAs']=r.concepts.map(iri);
   connection(r,s.input,r.id,'describesAsset','source_supported',s.evidence,'description');
  }
  for(const key of ['model','edition','releaseGroup','inEdition'])if(r[key])node['a:'+key]=iri(r[key]);
  if(r.kind==='AssetEvent'){node['a:eventKind']=r.eventKind;node['a:participant']=iri(r.participant);node['a:sourceInput']=iri(s.input);if(r.eventDate)node['a:occurredOn']=literal(r.eventDate,'date');}
  if(r.parent)connection(r,r.parent,r.id,'hasComponent','source_supported',s.evidence,'component');
  for(const o of r.observations){
   const obs=managed(r,r.id+':observation:'+o.field,'a:AssetObservation',r.title+' · '+o.field);
   Object.assign(obs,{'a:observedSubject':iri(r.id),'a:field':iri(NS.f+o.field),'a:valueStatus':o.status});
   if(o.status==='known'){
    obs['a:sourceInput']=iri(s.input);obs['a:basis']=o.basis;
    if(o.type==='number'){obs['a:numberValue']=literal(o.value,'decimal');obs['a:unit']=o.unit;}
    else if(o.type==='reference')obs['a:referenceValue']=iri(o.value);
    else obs['a:textValue']=o.value;
   }
  }
 }
 for(const r of db.ideas){
  const w=managed(r,r.id,'n:WorkInProgress');const m=managed(r,r.id+':mission','n:Mission',r.mission);const s=await source(r);
  w['n:alignedWith']=iri(m['@id']);w['n:usesInput']=iri(s.input);
  r.assets.forEach((asset,i)=>connection(r,asset,r.id,'inspiresWork','creative_proposal',s.evidence,String(i)));
 }
 return {'@context':NS,'@graph':nodes};
}
export function removeRecord(db,id){
 if(db.ideas.some(i=>i.assets.includes(id))||db.records.some(r=>r.id!==id&&(['model','edition','releaseGroup','inEdition','parent','participant'].some(k=>r[k]===id)||r.observations.some(o=>o.type==='reference'&&o.value===id))))throw new Error('รายการนี้ยังถูกอ้างอิง กรุณาแก้ความเชื่อมโยงก่อนลบ');
 return {...db,records:db.records.filter(r=>r.id!==id),ideas:db.ideas.filter(r=>r.id!==id)};
}

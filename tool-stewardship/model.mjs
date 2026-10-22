export const intentLabels={undecided:'ยังไม่ตัดสินใจ',retain:'เก็บใช้งานต่อ',sell:'ขายส่งต่อ',gift:'มอบให้',bequeath:'วางแผนมรดก'};
export const purposeLabels={insurance_replacement:'มูลค่าทดแทนเพื่อประกัน',resale_estimate:'ประมาณราคาขายต่อ',asking_price:'ราคาที่ตั้งขาย'};
export const blank=()=>({story:'',learning:'',care:'',condition:'',conditionDate:'',defects:'',includes:'',handover:'',successor:'',intent:'undecided',valuation:null});
export function validate(db){
 if(!db||db.version!=='1.0.0'||!Array.isArray(db.records)||db.records.length>2000)throw Error('รูปแบบไฟล์ไม่รองรับ');
 const ids=new Set(),uuids=new Set();
 for(const r of db.records){
  if(!/^AST-\d{6}$/.test(r.id)||ids.has(r.id)||!r.source?.uuid||uuids.has(r.source.uuid))throw Error('รหัสหรือ UUID ซ้ำ / ไม่ถูกต้อง');ids.add(r.id);uuids.add(r.source.uuid);
  if(!['AssetItem','Component','ProductModel'].includes(r.declaredKind))throw Error('ชนิดรายการไม่รองรับ');
  if(typeof r.title!=='string'||!r.title.trim()||typeof r.sourceText!=='string'||!Array.isArray(r.observations)||!r.revision||!r.source.textHash||r.access!=='private')throw Error('ข้อมูลต้นทางไม่ครบหรือสิทธิ์ไม่ถูกต้อง');
  const s=r.stewardship;if(!s||!Object.hasOwn(intentLabels,s.intent))throw Error('แผนส่งต่อไม่ถูกต้อง');
  for(const k of Object.keys(blank()).filter(k=>!['valuation','intent'].includes(k)))if(typeof s[k]!=='string'||s[k].length>20000)throw Error('ข้อความรายละเอียดไม่ถูกต้อง');
  if(s.conditionDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(s.conditionDate)||!Number.isFinite(Date.parse(s.conditionDate))||new Date(s.conditionDate).toISOString().slice(0,10)!==s.conditionDate))throw Error('วันที่ตรวจสภาพไม่ถูกต้อง');
  if(s.condition&&!s.conditionDate)throw Error('กรุณาระบุวันที่ตรวจสภาพ');
  const v=s.valuation;if(v&&(!Object.hasOwn(purposeLabels,v.purpose)||typeof v.amount!=='number'||!Number.isFinite(v.amount)||v.amount<=0||!['THB','USD','JPY','EUR','GBP'].includes(v.currency)||!/^\d{4}-\d{2}-\d{2}$/.test(v.asOf)||!Number.isFinite(Date.parse(v.asOf))||new Date(v.asOf).toISOString().slice(0,10)!==v.asOf||typeof v.basis!=='string'||!v.basis.trim()))throw Error('ราคาต้องมากกว่าศูนย์ พร้อมวัตถุประสงค์ สกุลเงิน วันที่ และฐานประเมิน');
 }
 return db;
}
export function gaps(r){const s=r.stewardship;return [!s.condition&&'สภาพล่าสุด',!s.defects&&'ข้อจำกัด/ตำหนิ',!s.includes&&'สิ่งที่ส่งมอบ',!s.handover&&'คำแนะนำผู้รับต่อ',!s.valuation&&'ราคาประเมิน'].filter(Boolean);}
export function publicPassport(r,selected){
 const allowed=['story','learning','condition','conditionDate','defects','includes','handover','care','successor'];
 const p={id:r.id,title:r.title,publication:'draft_for_owner_review',notice:'ฉบับเตรียมส่งต่อ ยังไม่ใช่ประกาศขายหรือการรับรองกรรมสิทธิ์'};
 for(const k of allowed)if(selected.includes(k)&&r.stewardship[k])p[k]=r.stewardship[k];
 if(selected.includes('asking_price')&&r.stewardship.valuation?.purpose==='asking_price')p.askingPrice={...r.stewardship.valuation};
 return p;
}
export function graph(db){
 validate(db);const nodes=[];
 for(const r of db.records){const id='urn:noppadol:asset:'+r.id,src='urn:noppadol:source:'+r.source.uuid+':'+r.source.textHash,pid=id+':passport';
 nodes.push({'@id':id,'@type':'a:'+r.declaredKind,'label':r.id,'sourceTitle':r.title,'identityStatus':r.identityStatus,'prov:wasDerivedFrom':{'@id':src},'observations':r.observations,'access':'private','reviewStatus':r.reviewStatus});
 nodes.push({'@id':src,'@type':'prov:Entity','sourceUUID':r.source.uuid,'textHash':r.source.textHash,'sourceText':r.sourceText});
 const p={'@id':pid,'@type':'s:ToolPassport','label':'ToolPassport','s:describesAsset':{'@id':id},'ownerNotes':r.stewardship,'access':'private','publication':'draft'};
 if(r.stewardship.valuation){const vid=pid+':valuation';p['s:hasValuation']={'@id':vid};nodes.push({'@id':vid,'@type':'s:Valuation',...r.stewardship.valuation,'basisStatus':'owner_reported_unreviewed'});}
 if(r.stewardship.condition){const cid=pid+':condition';p['s:hasAssessment']={'@id':cid};nodes.push({'@id':cid,'@type':'s:ConditionAssessment','description':r.stewardship.condition,'asOf':r.stewardship.conditionDate});}
 if(r.stewardship.intent!=='undecided'){const tid=pid+':plan';p['s:hasTransferPlan']={'@id':tid};nodes.push({'@id':tid,'@type':'s:TransferPlan','intent':r.stewardship.intent,'status':'intention_only'});}
 nodes.push(p);}
 return {'@context':{'@vocab':'urn:noppadol:stewardship:',a:'urn:noppadol:assets:ontology:',s:'urn:noppadol:stewardship:',prov:'http://www.w3.org/ns/prov#',label:'http://www.w3.org/2000/01/rdf-schema#label'},'@graph':nodes};
}

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const output=process.env.ASSET_TEST_OUTPUT||path.join(os.tmpdir(),'noppadol-asset-tests');
import {emptyDB,id,validateDB,exportGraph,removeRecord} from '../../asset-studio/model.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../../asset-studio/standards/field-catalog.json',import.meta.url)));
const cv=JSON.parse(fs.readFileSync(new URL('../../asset-studio/standards/controlled-vocabulary.json',import.meta.url)));
const record=(over={})=>({id:id(),title:'กบไสไม้ทดสอบ <script>',creator:'Fixture only',createdAt:'2026-09-26T10:00:00Z',updatedAt:'2026-09-26T10:00:00Z',kind:'AssetItem',profile:'hand_plane',concepts:['urn:noppadol:assets:concept:hand-plane'],sourceText:'ข้อมูลสมมติสำหรับทดสอบเท่านั้น ใบกบกว้าง 50 mm 🌿',sourceURL:'',observations:[{field:'hand_plane.blade_width',status:'known',type:'number',value:'50',unit:'mm',basis:'measured'}],...over});
const fixture=()=>{const r=record();return {version:1,records:[r],ideas:[{id:id(),title:'ไอเดียทดสอบ',creator:'Fixture only',createdAt:r.createdAt,updatedAt:r.updatedAt,sourceText:'บันทึกสมมติ: งานช่างกับการเรียนรู้',mission:'สร้างความเข้าใจผ่านการลงมือทำ',rationale:'เสนอความสัมพันธ์เพื่อพัฒนาบทความ',limits:'ยังไม่พิสูจน์ ต้องทบทวน',assets:[r.id]}]};};
test('empty and full fixture valid',()=>{assert.deepEqual(validateDB(emptyDB(),catalog,cv),[]);assert.deepEqual(validateDB(fixture(),catalog,cv),[]);});
for(const [name,mutate] of [
 ['unregistered concept',d=>d.records[0].concepts.push('fake')],['missing source',d=>d.records[0].sourceText=''],['wrong field',d=>d.records[0].observations[0].field='fake'],['unknown with value',d=>d.records[0].observations[0].status='unknown'],['number without units',d=>d.records[0].observations[0].unit=''],['NaN number',d=>d.records[0].observations[0].value='NaN'],['exponential not decimal',d=>d.records[0].observations[0].value='1e3'],['wrong scope profile',d=>d.records[0].profile='camera'],['missing creator',d=>d.records[0].creator=''],['script URL',d=>d.records[0].sourceURL='javascript:alert(1)'],['duplicate ID',d=>d.ideas[0].id=d.records[0].id],['dangling idea',d=>d.ideas[0].assets=['missing']],['model points to item',d=>d.records[0].model=d.records[0].id],['invalid datetime',d=>d.records[0].createdAt='today'],['missing idea rationale',d=>d.ideas[0].rationale='']])test('reject '+name,()=>{const d=fixture();mutate(d);assert.ok(validateDB(d,catalog,cv).length);});
test('unknown without fabricated value valid',()=>{const d=fixture();Object.assign(d.records[0].observations[0],{status:'unknown',value:'',unit:''});assert.deepEqual(validateDB(d,catalog,cv),[]);});
test('do not delete referenced assets',()=>{const d=fixture();assert.throws(()=>removeRecord(d,d.records[0].id));const next=removeRecord(d,d.ideas[0].id);assert.equal(removeRecord(next,d.records[0].id).records.length,0);});
test('JSON-LD stable IDs, draft-only, provenance hash and proposal semantics',async()=>{
 const d=fixture(),a=await exportGraph(d,catalog,cv),b=await exportGraph(d,catalog,cv);assert.deepEqual(a,b);
 const all=a['@graph'];assert.equal(new Set(all.map(x=>x['@id'])).size,all.length);
 const source=all.find(x=>x['@type']==='n:TextSnapshot');const text=Buffer.from(source['n:storageRef'].split(',')[1],'base64').toString('utf8');assert.equal(text,d.records[0].sourceText);
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));assert.equal(source['n:sha256'],Buffer.from(hash).toString('hex'));
 const proposal=all.find(x=>x['n:relationKind']==='creative_proposal');const link=all.find(x=>x['@id']===proposal['b:evidenceLink']['@id']);assert.equal(link['n:role'],'context');
 assert.ok(all.filter(x=>x['n:title']).every(x=>x['n:audience']==='owner'&&x['n:reviewStatus']==='unreviewed'&&x['n:publication']==='draft'));
 fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'export.jsonld'),JSON.stringify(a));
});

test('component, event, release and track export preserve endpoint classes',async()=>{
 const d=fixture(),base=d.records[0];
 const add=(kind,extra={})=>{const r=record({kind,profile:'generic',concepts:[],observations:[],...extra});d.records.push(r);return r;};
 const model=add('ProductModel');base.model=model.id;
 add('Component',{parent:base.id});add('AssetEvent',{eventKind:'maintenance',participant:base.id,eventDate:'2026-09-26'});
 const group=add('ReleaseGroup'),edition=add('ReleaseEdition',{releaseGroup:group.id});add('TrackEntry',{inEdition:edition.id});add('AssetItem',{edition:edition.id,profile:'record_disc'});
 assert.deepEqual(validateDB(d,catalog,cv),[]);const graph=await exportGraph(d,catalog,cv);fs.writeFileSync(path.join(output,'all-types.jsonld'),JSON.stringify(graph));
 assert.ok(graph['@graph'].some(n=>n['b:predicate']?.['@id']==='urn:noppadol:assets:bridge:hasComponent'));
 assert.throws(()=>removeRecord(d,model.id));
 const event=d.records.find(r=>r.kind==='AssetEvent');event.participant=model.id;assert.ok(validateDB(d,catalog,cv).length);event.participant=base.id;event.eventDate='2026-02-30';assert.ok(validateDB(d,catalog,cv).length);
});

test('separate domain views preserve legacy data and cross-domain ideas',async()=>{
 const {domainOf,domainRecords,domainIdeas}=await import('../../asset-studio/domains.js');
 const d=fixture(),plane=d.records[0];const camera=record({profile:'camera',observations:[],concepts:['urn:noppadol:assets:concept:camera'],domain:'photography'});d.records.push(camera);d.ideas[0].assets.push(camera.id);
 const generic=record({profile:'generic',observations:[],concepts:[]});d.records.push(generic);
 assert.equal(domainOf(plane),'woodworking');assert.equal(domainOf(generic),null);assert.equal(domainRecords(d,'records').length,0);assert.equal(domainRecords(d,'photography').length,1);assert.equal(domainRecords(d,null).length,3);
 assert.equal(domainIdeas(d,'woodworking').length,1);assert.equal(domainIdeas(d,'photography').length,1);assert.deepEqual(validateDB(d,catalog,cv),[]);
 camera.domain='records';assert.ok(validateDB(d,catalog,cv).length);camera.domain='photography';plane.domain='typo';assert.ok(validateDB(d,catalog,cv).length);
});

test('every domain preset uses existing ontology kinds, profiles and metadata fields',async()=>{
 const {domains}=await import('../../asset-studio/domains.js');const {kinds,profiles}=await import('../../asset-studio/model.js');
 const fields=new Set(catalog.profiles.flatMap(p=>p.fields.map(f=>p.id+'.'+f.id)));const terms=new Set(cv.concepts.map(c=>c.uri));
 for(const app of Object.values(domains))for(const p of app.presets){assert.ok(kinds[p.kind]);assert.ok(profiles[p.profile]);assert.ok(app.kinds.includes(p.kind));assert.ok(app.profiles.includes(p.profile));for(const f of p.fields)assert.ok(fields.has(f),f);if(p.concept)assert.ok(terms.has('urn:noppadol:assets:concept:'+p.concept));}
});

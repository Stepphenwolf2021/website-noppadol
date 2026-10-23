import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';
import {validateCatalog,searchModels,makeLibraryRecord} from '../tool-stewardship/catalog.mjs';
import {validate,graph} from '../tool-stewardship/model.mjs';
import {catalogNetwork,selectNetwork} from '../tool-stewardship/graph-data.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../tool-stewardship/catalog/'+name,import.meta.url)));
const c=validateCatalog(read('all-tools.json')),v=validateCatalog(read('veritas.json')),lb=read('lubanplane.json');
test('Veritas source includes 1194 exact source items and 3 explicitly labelled families; prior providers unchanged',()=>{
 assert.equal(v.models.length,1197);assert.deepEqual(c.models.filter(m=>m.providerId==='veritas'),v.models);
 assert.deepEqual(c.models.filter(m=>m.id.includes(':lubanplane:')),lb.models);
 const items=v.models.filter(m=>m.sourceProductType==='item');assert.equal(items.length,1194);
 assert(items.every(m=>m.sku===m.sourceProductId&&m.id==='urn:noppadol:catalog:veritas:'+m.sourceProductId));
 const families=v.models.filter(m=>m.sourceProductType==='family_without_items');assert.equal(families.length,3);assert(families.every(m=>m.sku===null&&m.offerSnapshot.amount===null&&m.name.includes('รุ่นรวม')));
});
test('Exact router-plane SKU, Canadian retail snapshot and source URL survive extraction',()=>{
 const m=v.models.find(m=>m.sku==='05P3801');assert.equal(m.name,'Veritas Large Router Plane');assert.equal(m.sourceParentProductId,'52609');assert.equal(m.offerSnapshot.currency,'CAD');assert.equal(m.offerSnapshot.amount,239);assert.equal(m.attributes.Option,'Router Plane');assert(m.sourceURL.endsWith('/52609-veritas-router-plane'));assert(m.imageURLs.length>0);
 assert.equal(searchModels(c,{provider:'veritas',equipmentOnly:false}).length,1197);assert(searchModels(c,{provider:'veritas',query:'05P3801'}).some(n=>n.id===m.id));
});
test('Veritas graph filtering resolves edges and does not include other providers',()=>{
 const g=catalogNetwork(c),view=selectNetwork(g,{scope:'catalog',provider:'veritas',query:'05P3801'});assert.equal(view.roots.length,1);assert.equal(view.roots[0].data.sku,'05P3801');assert(view.nodes.filter(n=>n.type==='model').every(n=>n.data.providerId==='veritas'));
});
test('Alphanumeric Veritas selections validate while retail price never becomes personal valuation',async()=>{
 const m=v.models.find(m=>m.sku==='05P3801');const r=await makeLibraryRecord(m,'owned',c.version,webcrypto);const db={version:'1.0.0',access:'private',records:[r]};validate(db);assert.equal(r.stewardship.valuation,null);assert.equal(r.stewardship.condition,'');assert.equal(r.catalogReference.providerId,'veritas');assert.equal(graph(db)['@graph'].filter(n=>n['@id']===m.id).length,1);
});

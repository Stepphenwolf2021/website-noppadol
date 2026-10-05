import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const semantic=read('src/_data/semantic.json'),editorial=read('src/_data/editorial.json');
const byId=new Map(semantic.concepts.map(c=>[c.id,c]));
test('Public concepts retain identities and all semantic references resolve',()=>{
 assert.equal(byId.size,semantic.concepts.length);
 assert.equal(new Set(semantic.concepts.map(c=>c.uri)).size,semantic.concepts.length);
 for(const c of semantic.concepts){
  assert.match(c.uri,/^urn:noppadol:assets:concept:/);assert.ok(c.label&&c.graphLabel&&c.definitionEn);
  assert.match(c.url,/^\/knowledge\/[a-z0-9-]+\/$/);
  assert.equal(c.status,'editorial_proposal');
  for(const id of [...c.broader,...c.narrower,...c.related])assert.ok(byId.has(id),id);
  for(const id of c.related)assert.ok(byId.get(id).related.includes(c.id));
 }
});
test('Reader pages and new internal links exist in the production build',()=>{
 for(const url of ['/','/woodworking/','/records/','/knowledge/','/ontology/',...semantic.concepts.map(c=>c.url),...editorial.articles.map(a=>`/notes/${a.slug}/`)]){
  const file=path.join('_site',url,'index.html');assert.ok(fs.existsSync(file),url);
  const text=fs.readFileSync(file,'utf8');assert.match(text,/<html lang="th">/);
  for(const match of text.matchAll(/href="(\/(?:knowledge|woodworking|records|notes|ontology)[^"#?]*)"/g)){
   const target=match[1];assert.ok(fs.existsSync(path.join('_site',target,target.endsWith('/')?'index.html':'')),target);
  }
 }
});
test('Public graph uses the same concepts and editorial references as reader pages',()=>{
 const kg=read('_site/knowledge-graph.jsonld')['@graph'];const graph=new Map(kg.map(n=>[n['@id'],n]));
 for(const c of semantic.concepts)assert.equal(graph.get(c.uri).name,c.graphLabel);
 for(const a of editorial.articles){
  const n=graph.get(`https://noppadol.online/notes/${a.slug}/`);assert.ok(n);
  assert.deepEqual(n.about.map(x=>x['@id']),a.conceptIds.map(id=>byId.get(id).uri));
 }
 assert.ok(!kg.some(n=>String(n['@type']).includes('SourceRecord')));
 assert.ok(!kg.some(n=>String(n['@type']).includes('EditionMatch')));
});
test('New public artifacts contain no inventory, private evidence or workbench',()=>{
 const release=read('src/ontology/domains/release.json');assert.equal(release.personalRecordsIncluded,0);
 const inspect=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else inspect.push(f);}}
 walk('_site/knowledge');walk('_site/notes');walk('_site/ontology/domains');
 inspect.push('_site/knowledge-graph.jsonld','src/_data/editorial.json','src/_data/semantic.json');
 for(const f of inspect){const text=fs.readFileSync(f,'utf8');assert.doesNotMatch(text,/AST-\d{6}|binderPath|sourceText|\/Users\/|\/Draft\/Asset\//,f);}
 assert.ok(!fs.existsSync('_site/workflow'));assert.ok(!fs.existsSync('_site/data/processed-assets'));
 for(const a of editorial.articles){assert.ok(a.title&&a.body);assert.ok(!('sourceIds' in a));}
});

test('Release hashes match every shipped ontology artifact',()=>{
 const release=read('src/ontology/domains/release.json');
 for(const [name,expected] of Object.entries(release.files)){
  for(const base of ['src/ontology/domains','_site/ontology/domains'])assert.equal(createHash('sha256').update(fs.readFileSync(path.join(base,name))).digest('hex'),expected,name);
 }
});

test('Hand plane metadata omits the ten fields removed by the owner',()=>{
 const profile=read('src/ontology/domains/metadata-profile.json');
 assert.equal(profile.version,'1.4.1');
 const fields=profile.fields.filter(f=>f.id.startsWith('hand_plane.'));
 assert.equal(fields.length,14);
 for(const name of ['intended_workpiece_wood','blade','blade_thickness','blade_construction','setup_notes','sharpening_history','chipbreaker','frog','heat_treatment','sole_adjustments'])assert.ok(!fields.some(f=>f.id==='hand_plane.'+name),name);
});

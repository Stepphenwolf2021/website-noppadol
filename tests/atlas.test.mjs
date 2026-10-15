import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import atlas from '../src/_data/atlas.js';
const html=url=>fs.readFileSync(path.join('_site',url,'index.html'),'utf8');
test('All seven navigable topics are built with truthful content or an empty state',()=>{
 assert.equal(atlas.topics.length,7);assert.equal(new Set(atlas.topics.map(t=>t.url)).size,7);
 for(const t of atlas.topics){const page=html(t.url);assert.ok(page.includes(t.label));assert.ok(page.includes(t.th));assert.match(page,/my place in the universe/);
  assert.ok(page.includes('อ่านเรื่องนี้')||page.includes('ยังไม่มีบทความที่เผยแพร่'),t.id);
  for(const m of page.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)){let target=m[1];assert.ok(fs.existsSync(path.join('_site',target,target.endsWith('/')?'index.html':'')),`${t.id}: ${target}`);}
 }
});
test('Homepage and exported graph derive topic links from the same public data',()=>{
 const home=html('/'),graph=JSON.parse(fs.readFileSync('_site/atlas.json','utf8'))['@graph'];
 assert.equal((home.match(/class="topic-orbit /g)||[]).length,7);
 assert.deepEqual(graph[0].hasPart.map(n=>n['@id']),atlas.topics.map(t=>t.uri));
 for(const t of atlas.topics){assert.ok(home.includes(`href="${t.url}"`));const n=graph.find(n=>n['@id']===t.uri);assert.equal(n.name,t.label);assert.equal(n.isPartOf['@id'],graph[0]['@id']);}
 assert.match(home,/dubito ergo non solus/);assert.match(home,/i doubt, therefore i am not alone/);
});
test('Editorial memberships and concept links reuse public source identities',()=>{
 const graph=JSON.parse(fs.readFileSync('_site/atlas.json','utf8'))['@graph'];
 for(const t of atlas.topics){const actual=graph.find(n=>n['@id']===t.uri).hasPart.map(n=>n['@id']);const expected=atlas.articles.filter(a=>t.domain&&a.domain===t.domain).map(a=>`https://noppadol.online${a.url}`);assert.deepEqual(actual,expected);}
 for(const a of atlas.articles){for(const c of a.concepts){assert.ok(html(a.url).includes(c.url));assert.ok(fs.existsSync(path.join('_site',c.url,'index.html')));}}
});
test('Atlas projection ships no private workbench or mockup articles',()=>{
 for(const url of ['/', '/atlas/',...atlas.topics.map(t=>t.url)]){const page=html(url);assert.doesNotMatch(page,/AST-\d{6}|binderPath|sourceText|\/Users\/|private_draft|เรียนรู้ผ่านการลงมือทำ/);}
});

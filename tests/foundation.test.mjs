import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {articleInTopic} from '../tools/topic-membership.mjs';
const article=JSON.parse(fs.readFileSync('src/_data/editorial.json')).articles.find(a=>a.id==='the-foundation-01');
const page=fs.readFileSync('_site/notes/the-foundation-01/index.html','utf8');
test('Foundation has exactly its selected topics with no fabricated publishing date',()=>{
 for(const id of ['knowledge-management','ai']){assert.equal(articleInTopic(article,{id}),true);assert.ok(fs.readFileSync(`_site/topics/${id}/index.html`,'utf8').includes('/notes/the-foundation-01/'));}
 assert.equal(articleInTopic(article,{id:'coffee',domain:'vinyl'}),false);
 const ld=JSON.parse(page.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1]);
 assert.equal(ld.datePublished,undefined);assert.equal(ld.author.name,article.author);assert.equal(ld.isPartOf.length,2);assert.equal(ld.about.length,0);
 const kg=JSON.parse(fs.readFileSync('_site/knowledge-graph.jsonld'))['@graph'].find(n=>n['@id']===ld['@id']);assert.deepEqual(kg.isPartOf,ld.isPartOf);assert.equal(kg.image,ld.image);
 const graph=JSON.parse(fs.readFileSync('_site/knowledge-graph.jsonld'))['@graph'];for(const topic of kg.isPartOf)assert.ok(graph.some(n=>n['@id']===topic['@id']));
});
test('Reviewed body, both illustrations and human authorship are retained without private metadata',()=>{
 assert.ok(page.includes('ในระบบที่ผมลองตอนนั้น'));assert.ok(page.includes('ไม่ได้แปลว่า AI จะไม่มั่วอีก'));assert.ok(page.includes('Semantic Layer'));assert.ok(!page.includes('Sematic Layer'));
 for(const path of ['memex.webp','platform-v6.webp','platform-v6.png'])assert.ok(fs.existsSync(`_site/assets/articles/foundation/${path}`));
 assert.ok(page.includes('ผู้เขียนเขียนและเรียบเรียง'));assert.ok(page.includes('ผู้เขียนอนุมัติขั้นสุดท้าย'));
 assert.doesNotMatch(page,/sourceUuid|sourceRevision|\[CONTENT START\]|declared_purpose|\/Users\/|ready_for_ai|internal|unknown/);
});

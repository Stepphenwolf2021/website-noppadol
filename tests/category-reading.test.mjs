import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import atlas from '../src/_data/atlas.js';
const read=url=>fs.readFileSync(`_site${url}index.html`,'utf8');
test('Single-story categories render full content; empty and multi-story categories keep their own presentation',()=>{
 let single=0,multiple=0,empty=0;
 for(const t of atlas.topics){const page=read(t.url);const count=Number(page.match(/data-content-key="content.count">(\d+) เรื่อง/)[1]);
  if(count===1){single++;assert.ok(page.includes('category-full-article'));assert.ok(!page.includes('class="text-story category-story"'));}
  else if(count>1){multiple++;assert.ok(page.includes('class="text-story category-story"'));assert.ok(!page.includes('class="category-full-article"'));}
  else{empty++;assert.ok(page.includes('empty-state'));}
 }
 assert.ok(single>0);assert.ok(multiple>0);assert.ok(empty>0);
 const km=read('/topics/knowledge-management/');assert.ok(km.includes('ไม่ได้การันตีว่า AI จะไม่มั่วอีก'));assert.ok(km.includes('platform-v10.webp'));assert.ok(km.includes('memex.webp'));assert.equal((km.match(/<h1[ >]/g)||[]).length,1);
});
test('Homepage introduces Foundation with actual opening paragraphs and a link to its full article',()=>{
 const page=read('/');const a=atlas.articles.find(a=>a.id==='the-foundation-01');assert.ok(page.includes('home-feature'));assert.ok(page.includes(a.body.trim().split('\n\n')[0]));assert.ok(page.includes('platform-v10.webp'));assert.ok(page.includes(`href="${a.url}"`));assert.equal((page.match(/class="topic-orbit /g)||[]).length,8);
});

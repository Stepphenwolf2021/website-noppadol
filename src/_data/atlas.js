import fs from 'node:fs';
const editorial=JSON.parse(fs.readFileSync(new URL('./editorial.json',import.meta.url),'utf8'));
const interest=JSON.parse(fs.readFileSync(new URL('./interestGraph.json',import.meta.url),'utf8'));
const semantic=JSON.parse(fs.readFileSync(new URL('./semantic.json',import.meta.url),'utf8'));
// Public navigation memberships, not inferred facts between disciplines.
const definitions=[
 ['woodworking','woodworking','งานไม้','เครื่องมือ วัสดุ และสิ่งที่เรียนรู้ระหว่างลงมือทำ','/woodworking/',20,24,'woodworking',['wood']],
 ['book-movie-music','book.movie.music','หนังสือ ภาพยนตร์ ดนตรี','เรื่องเล่า ภาพ และเสียงที่ชวนให้กลับมาคิด','/topics/book-movie-music/',80,24,'vinyl',['screen','books']],
 ['coffee','coffee','กาแฟ','จังหวะเล็ก ๆ ของการชง การดื่ม และการสังเกต','/topics/coffee/',13,53,null,['coffee']],
 ['gardening','gardening','สวนคนเมือง','พื้นที่สีเขียวและการเรียนรู้จากการดูแลสิ่งที่เติบโต','/topics/gardening/',87,53,null,['farm']],
 ['ai','ai','ปัญญาประดิษฐ์','เครื่องมือ ความคิด และคำถามเกี่ยวกับการเปลี่ยนแปลง','/topics/ai/',23,84,null,['tech']],
 ['perspective','perspective','มุมมอง','บันทึกความคิดและข้อสังเกตที่เปิดมุมมองใหม่','/topics/perspective/',77,84,null,['living']],
 ['knowledge-management','knowledge management','การจัดการความรู้','เชื่อมความคิด แหล่งที่มา และสิ่งที่อยากกลับมาเรียนรู้','/topics/knowledge-management/',50,10,null,[]],
 ['photography','photography','การถ่ายภาพ','การมอง แสง และเรื่องราวที่บันทึกผ่านภาพ','/topics/photography/',50,89,null,['photo']]
];
// Hints are a read-only view of public vocabulary/metadata, never new assertions.
function ontologyHints(id,domain,legacy){
 const nodes=interest['@graph'].filter(n=>legacy.some(k=>n['@id']===`https://noppadol.online/topic/${k}`));
 const concepts=domain?semantic.concepts.filter(c=>c.domains.includes(domain)).slice(0,3).map(c=>c.graphLabel):
 nodes.flatMap(n=>[n.alternateName,...(n.closeMatch||[]),...(n.relatedMatch||[])]).map(v=>v.replace('https://noppadol.online/concept/','').replaceAll('-',' '));
 if(id==='knowledge-management')concepts.push('knowledge management');
 return [
  {radius:98,text:[...new Set(concepts)].slice(0,3).join(' · ')},
  {radius:132,text:'prefLabel · definition · inScheme'},
  {radius:166,text:'skos:Concept · schema:DefinedTerm · InterestMap'}
 ];
}
const topics=definitions.map(([id,label,th,description,url,x,y,domain,legacy])=>({id,label,th,description,url,x,y,domain,legacy,hints:ontologyHints(id,domain,legacy),uri:`https://noppadol.online${url}#topic`}));
export default {version:'1.1.0',topics,legacyDomains:semantic.domains.filter(d=>d.id!=='woodworking'),portrait:'/assets/atlas/seize-the-day.webp',articles:editorial.articles.map(a=>({...a,url:`/notes/${a.slug}/`,concepts:a.conceptIds.map(id=>semantic.concepts.find(c=>c.id===id)).filter(Boolean)})),concepts:semantic.concepts,mission:'เชื่อมความสนใจ เนื้อหา และแนวคิด เพื่อกลับมาเรียนรู้และมองเรื่องเดิมในมุมใหม่',graph:{'@context':{'@vocab':'https://schema.org/'},'@graph':[{'@id':'https://noppadol.online/#universe','@type':'CollectionPage',name:'seize the day universe',hasPart:topics.map(t=>({'@id':t.uri}))},...topics.map(t=>({'@id':t.uri,'@type':'CollectionPage',name:t.label,description:t.description,url:`https://noppadol.online${t.url}`,...(t.id==='photography'?{about:{'@id':'https://noppadol.online/topic/photo'}}:{}),isPartOf:{'@id':'https://noppadol.online/#universe'},hasPart:editorial.articles.filter(a=>t.domain && a.domain===t.domain).map(a=>({'@id':`https://noppadol.online/notes/${a.slug}/`}))}))]}};

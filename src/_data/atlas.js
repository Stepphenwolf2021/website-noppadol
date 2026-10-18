import fs from 'node:fs';
const editorial=JSON.parse(fs.readFileSync(new URL('./editorial.json',import.meta.url),'utf8'));
const interest=JSON.parse(fs.readFileSync(new URL('./interestGraph.json',import.meta.url),'utf8'));
const semantic=JSON.parse(fs.readFileSync(new URL('./semantic.json',import.meta.url),'utf8'));
import {articleInTopic} from '../../tools/topic-membership.mjs';
// Public navigation memberships, not inferred facts between disciplines.
const definitions=[
 ['woodworking','woodworking','งานไม้','verum ipsum factum เรารู้เพียงสิ่งที่เราลงมือทำ -จัมบาตติสตา วิโก นักปรัชญาชาวอิตาลี','/woodworking/',20,24,'woodworking',['wood']],
 ['book-movie-music','book.movie.music','หนังสือ.ภาพยนต์.ดนตรี','บันทึกความรื่นรมณ์ที่น่าจดจำในชีวิต','/topics/book-movie-music/',80,24,'vinyl',['screen','books']],
 ['coffee','coffee','กาแฟ','don’t worry, be coffee','/topics/coffee/',13,53,null,['coffee']],
 ['gardening','gardening','สวนคนเมือง','from data to flavor','/topics/gardening/',87,53,null,['farm']],
 ['ai','ai','ปัญญาประดิษฐ์','ai เก่งขึ้นทุกวัน เราต้องลึกซึ้งขึ้นทุกเวลา','/topics/ai/',23,84,null,['tech']],
 ['perspective','perspective','มุมมอง','i doubt, therefore i am not alone.','/topics/perspective/',77,84,null,['living']],
 ['knowledge-management','knowledge management','การบริหารจัดการความรู้','เพื่อให้เกิดความรู้ จงเติมบางสิ่งเข้าไปทุกวัน\nเพื่อให้เกิดปัญญา จงขจัดบางสิ่งออกไปทุกวัน -เหลาจื่อ นักปรัชญาชาวจีน','/topics/knowledge-management/',50,10,null,[]],
 ['photography','photography','การถ่ายภาพ','ในวันเวลาที่เรากดชัตเตอร์มากขึ้นแต่ถ่ายภาพน้อยลง','/topics/photography/',50,89,null,['photo']]
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
export default {version:'1.1.0',topics,legacyDomains:semantic.domains.filter(d=>d.id!=='woodworking'),portrait:'/assets/atlas/seize-the-day.webp',articles:editorial.articles.map(a=>({...a,url:`/notes/${a.slug}/`,concepts:a.conceptIds.map(id=>semantic.concepts.find(c=>c.id===id)).filter(Boolean)})),concepts:semantic.concepts,mission:'เชื่อมความสนใจ เนื้อหา และแนวคิด เพื่อกลับมาเรียนรู้และมองเรื่องเดิมในมุมใหม่',graph:{'@context':{'@vocab':'https://schema.org/'},'@graph':[{'@id':'https://noppadol.online/#universe','@type':'CollectionPage',name:'seize the day universe',hasPart:topics.map(t=>({'@id':t.uri}))},...topics.map(t=>({'@id':t.uri,'@type':'CollectionPage',name:t.label,description:t.description,url:`https://noppadol.online${t.url}`,...(t.id==='photography'?{about:{'@id':'https://noppadol.online/topic/photo'}}:{}),isPartOf:{'@id':'https://noppadol.online/#universe'},hasPart:editorial.articles.filter(a=>articleInTopic(a,t)).map(a=>({'@id':`https://noppadol.online/notes/${a.slug}/`}))}))]}};

// ============================================================
// build-interest-ontology.mjs
// แหล่งความจริงเดียว = src/_data/site.js (topics, edges, departments)
// ออก 3 ไฟล์:
//   src/ontology/interest-map.ttl       (SKOS + schema.org, สำหรับ RDF/Neo4j/SPARQL)
//   src/ontology/interest-map.jsonld    (เหมือนกัน เสิร์ฟเป็นไฟล์)
//   src/_data/interestGraph.json        (ฝัง JSON-LD ในหน้าแรกผ่าน Eleventy)
// ============================================================
import site from "../src/_data/site.js";
import { writeFileSync } from "node:fs";

const BASE = "https://noppadol.online";
const T = site.topics;
const KEYS = Object.keys(T);

// adjacency (skos:related, symmetric → เก็บสองทาง)
const rel = Object.fromEntries(KEYS.map(k => [k, new Set()]));
for (const [a, b] of site.edges) { rel[a].add(b); rel[b].add(a); }

// dept (เดิม) → topic (ใหม่) : std:<Cap> skos:broader topic:<id>
const DEPT_STD = { comment:"Comment", bench:"Bench", cup:"Cup", garden:"Garden", annals:"Annals", critics:"Critics" };

// จับคู่กับคลังแนวคิดเดิม (con:) — reuse ก่อนสร้างใหม่
const ALIGN = {
  coffee: { closeMatch:["coffee"] },
  farm:   { closeMatch:["food-and-agriculture"], related:["sustainability"] },
  tech:   { closeMatch:["artificial-intelligence"], related:["knowledge-management"] },
  wood:   { closeMatch:["craft"] },
  photo:  { related:["sensory"] },
  screen: { related:["creative-economy","sensory"] },
  books:  { related:["learning"] },
  living: { related:["health-and-wellbeing"] },
};

const STD_SET = "std:InterestMap";
const SETID = `${BASE}/ns/std#InterestMap`;
const PERSON = `${BASE}/${site.author.id}`;
const tIRI = k => `${BASE}/topic/${k}`;
const cIRI = id => `${BASE}/concept/${id}`;

// ---------------- TTL ----------------
const esc = s => String(s).replace(/\\/g,"\\\\").replace(/"/g,'\\"');
let ttl = `@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix schema: <https://schema.org/> .
@prefix dct:    <http://purl.org/dc/terms/> .
@prefix std:    <${BASE}/ns/std#> .
@prefix topic:  <${BASE}/topic/> .
@prefix con:    <${BASE}/concept/> .
@prefix person: <${BASE}/person/> .

# ── Concept Scheme / DefinedTermSet : แผนที่ความสนใจ (Interest Map) ──
std:InterestMap a skos:ConceptScheme, schema:DefinedTermSet ;
    dct:title "noppadol.online — Interest Map"@en ;
    skos:prefLabel "แผนที่ความสนใจ noppadol.online"@th ;
    schema:name "แผนที่ความสนใจ noppadol.online"@th ;
    dct:creator person:${site.author.id.split("/").pop()} ;
`;
ttl += KEYS.map(k => `    skos:hasTopConcept topic:${k}`).join(" ;\n") + " .\n\n";

for (const k of KEYS) {
  const t = T[k];
  const lines = [];
  lines.push(`topic:${k} a skos:Concept, schema:DefinedTerm`);
  lines.push(`    skos:inScheme std:InterestMap`);
  lines.push(`    skos:topConceptOf std:InterestMap`);
  lines.push(`    schema:inDefinedTermSet std:InterestMap`);
  lines.push(`    skos:prefLabel "${esc(t.th)}"@th, "${esc(t.en)}"@en`);
  lines.push(`    schema:name "${esc(t.th)}"@th`);
  lines.push(`    skos:definition "${esc(t.blurb)}"@th`);
  const rels = [...rel[k]].sort();
  if (rels.length) lines.push(`    skos:related ${rels.map(r=>`topic:${r}`).join(", ")}`);
  const al = ALIGN[k] || {};
  if (al.closeMatch) lines.push(`    skos:closeMatch ${al.closeMatch.map(c=>`con:${c}`).join(", ")}`);
  if (al.related)    lines.push(`    skos:relatedMatch ${al.related.map(c=>`con:${c}`).join(", ")}`);
  ttl += lines.join(" ;\n") + " .\n\n";
}

// crosswalk : แผนกเดิม broader → หมวดใหม่
ttl += "# ── Crosswalk : แผนก (เดิม) อยู่ใต้หมวดความสนใจ (ใหม่) ──\n";
for (const [dept, meta] of Object.entries(site.departments)) {
  ttl += `std:${DEPT_STD[dept]} skos:broader topic:${meta.topic} .\n`;
}
ttl += "\n";

// person + book
ttl += `# ── ผู้เขียน (โหนดกลาง = The Thinker) ──
person:${site.author.id.split("/").pop()} a schema:Person ;
    schema:name "${esc(site.author.name)}"@th ;
    schema:url <${BASE}/> ;
`;
ttl += `    schema:knowsAbout ${KEYS.map(k=>`topic:${k}`).join(", ")} .\n\n`;

ttl += `# ── ชุดรวมเล่มอนาคต (ไม่เน้นบนเว็บ) ──
std:SeizeTheDayBook a schema:Book, schema:CreativeWorkSeries ;
    schema:name "${esc(site.book.name)}" ;
    schema:description "${esc(site.book.note)}"@th ;
    schema:inLanguage "th" ;
    schema:author person:${site.author.id.split("/").pop()} ;
    schema:isBasedOn <${BASE}/> .
`;

// ---------------- JSON-LD ----------------
const ctx = {
  "@vocab":"https://schema.org/",
  skos:"http://www.w3.org/2004/02/skos/core#",
  std:`${BASE}/ns/std#`,
  dct:"http://purl.org/dc/terms/",
  topic:`${BASE}/topic/`,
  con:`${BASE}/concept/`,
  person:`${BASE}/person/`,
  related:{ "@id":"skos:related", "@type":"@id" },
  relatedMatch:{ "@id":"skos:relatedMatch", "@type":"@id" },
  closeMatch:{ "@id":"skos:closeMatch", "@type":"@id" },
  broader:{ "@id":"skos:broader", "@type":"@id" },
  inScheme:{ "@id":"skos:inScheme", "@type":"@id" },
  topConceptOf:{ "@id":"skos:topConceptOf", "@type":"@id" },
  hasTopConcept:{ "@id":"skos:hasTopConcept", "@type":"@id" },
  prefLabel:"skos:prefLabel",
  definition:"skos:definition",
  inDefinedTermSet:{ "@type":"@id" },
  hasDefinedTerm:{ "@type":"@id" },
  knowsAbout:{ "@type":"@id" },
  creator:{ "@id":"dct:creator", "@type":"@id" },
  isBasedOn:{ "@type":"@id" },
  author:{ "@type":"@id" },
};

const graph = [];
graph.push({
  "@type":"WebSite", "@id":`${BASE}/#site`,
  name:"noppadol.online", description:site.tagline, inLanguage:"th",
  author:PERSON,
});
graph.push({
  "@type":"Person", "@id":PERSON, name:site.author.name, url:`${BASE}/`,
  knowsAbout:KEYS.map(tIRI),
});
graph.push({
  "@type":["DefinedTermSet","skos:ConceptScheme"], "@id":SETID,
  name:"แผนที่ความสนใจ noppadol.online",
  creator:PERSON,
  hasDefinedTerm:KEYS.map(tIRI),
  hasTopConcept:KEYS.map(tIRI),
});
for (const k of KEYS) {
  const t = T[k];
  const node = {
    "@type":["DefinedTerm","skos:Concept"], "@id":tIRI(k),
    name:t.th, alternateName:t.en, description:t.blurb,
    prefLabel:[{ "@value":t.th, "@language":"th" }, { "@value":t.en, "@language":"en" }],
    definition:{ "@value":t.blurb, "@language":"th" },
    inDefinedTermSet:SETID, inScheme:SETID, topConceptOf:SETID,
    related:[...rel[k]].sort().map(tIRI),
  };
  const al = ALIGN[k] || {};
  if (al.closeMatch) node.closeMatch = al.closeMatch.map(cIRI);
  if (al.related)    node.relatedMatch = al.related.map(cIRI);
  graph.push(node);
}
// crosswalk dept
for (const [dept, meta] of Object.entries(site.departments)) {
  graph.push({ "@id":`${BASE}/ns/std#${DEPT_STD[dept]}`, "@type":"skos:Concept", broader:tIRI(meta.topic) });
}
graph.push({
  "@type":["Book","CreativeWorkSeries"], "@id":`${BASE}/book/seize-the-day`,
  name:site.book.name, description:site.book.note, inLanguage:"th",
  author:PERSON, isBasedOn:`${BASE}/#site`,
});

const jsonld = { "@context":ctx, "@graph":graph };

// ---------------- write ----------------
writeFileSync(new URL("../src/ontology/interest-map.ttl", import.meta.url), ttl);
writeFileSync(new URL("../src/ontology/interest-map.jsonld", import.meta.url), JSON.stringify(jsonld, null, 2));
writeFileSync(new URL("../src/_data/interestGraph.json", import.meta.url), JSON.stringify(jsonld, null, 2));
console.log(`interest-ontology: ${KEYS.length} topics, ${site.edges.length} edges → ttl + jsonld + _data`);

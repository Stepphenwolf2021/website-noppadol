// build-graph.js
// รวม front matter ของบทความทุกไฟล์ → _site/knowledge-graph.jsonld
// (กราฟเดียวทั้งเว็บ — โหลดเข้า Neo4j (n10s) / triple store / ให้ AI ใช้)
//
// รันหลัง eleventy build:  node tools/build-graph.js
// หรือ:                    npm run build

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const BASE = "https://noppadol.online";
const CONTENT_DIR = "src/content";
const OUT = "_site/knowledge-graph.jsonld";

const TYPE_MAP = {
  Article: "Article", OpinionPiece: "OpinionNewsArticle", Review: "Review",
  HowTo: "HowTo", CoffeeNote: "Article", GardenNote: "Article", Note: "Article",
};
const id = (s) => (s ? `${BASE}/${String(s).replace(/^\/+/, "")}` : undefined);
const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

// อ่าน front matter จากไฟล์ .md
function readFrontMatter(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  try { return yaml.load(m[1]); } catch (e) {
    console.warn(`⚠️  YAML ผิดที่ ${file}: ${e.message}`);
    return null;
  }
}

// เดิน directory หาไฟล์ .md ทั้งหมด
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const nodes = [];
const concepts = new Map();   // เก็บ concept/entity ที่อ้างถึง (dedupe ด้วย @id)

function addEntity(o, fallbackType) {
  if (!o || !o.id) return;
  const iri = id(o.id);
  if (!concepts.has(iri)) {
    concepts.set(iri, {
      "@id": iri,
      "@type": o.type || fallbackType,
      name: o.name,
    });
  }
}

for (const file of walk(CONTENT_DIR)) {
  const d = readFrontMatter(file);
  if (!d || !d.department || !d.title) continue;

  const node = {
    "@type": TYPE_MAP[d.content_type] || "Article",
    "@id": id(d.slug),
    [d.content_type === "Review" ? "name" : "headline"]: d.title,
    inLanguage: d.lang || "th",
    datePublished: d.date_published,
    department: `${BASE}/ns/std#${cap(d.department)}`,
    author: { "@type": "Person", "@id": id(d.author_id), name: d.author },
  };
  if (d.issue) node.isPartOf = { "@type": "PublicationIssue", issueNumber: d.issue };
  if (Array.isArray(d.about)) {
    node.about = d.about.map((a) => id(a.id));
    d.about.forEach((a) => addEntity(a, "DefinedTerm"));
  }
  if (Array.isArray(d.mentions)) {
    node.mentions = d.mentions.map((m) => id(m.id));
    d.mentions.forEach((m) => addEntity(m, "Thing"));
  }
  if (Array.isArray(d.related)) node.isRelatedTo = d.related.map((r) => id(r));
  if (d.content_type === "Review" && d.review_item) {
    node.itemReviewed = id(d.review_item.id);
    addEntity(d.review_item, "CreativeWork");
  }
  nodes.push(prune(node));
}

function prune(o) {
  if (Array.isArray(o)) return o.map(prune);
  if (o && typeof o === "object") {
    const r = {};
    for (const [k, v] of Object.entries(o))
      if (v !== undefined && v !== null && v !== "") r[k] = prune(v);
    return r;
  }
  return o;
}

const graph = {
  "@context": `${BASE}/ontology/std-context.jsonld`,
  "@graph": [...nodes, ...concepts.values()],
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(graph, null, 2));
console.log(`✓ knowledge-graph.jsonld — ${nodes.length} บทความ, ${concepts.size} entity → ${OUT}`);

// ชั้น A (schema.org / SEO): แปลง front matter → JSON-LD
// รองรับ "ทะเบียน entity กลาง" (src/_data/entities.json): อ้าง entity ด้วย id
// แล้วดึง name/type/sameAs จากทะเบียนอัตโนมัติ — reconcile ครั้งเดียว ใช้ได้ทุกบทความ
// ยังรองรับ same_as แบบ inline ใน front matter (inline ชนะทะเบียน)

export const TYPE_MAP = {
  Article: "Article",
  OpinionPiece: "OpinionNewsArticle",
  Review: "Review",
  HowTo: "HowTo",
  CoffeeNote: "Article",
  GardenNote: "Article",
  Note: "Article",
};

const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
const sameAs = (v) =>
  Array.isArray(v) ? (v.length ? v : undefined) : v || undefined;

function prune(obj) {
  if (Array.isArray(obj)) return obj.map(prune);
  if (obj && typeof obj === "object") {
    const o = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null || v === "") continue;
      o[k] = prune(v);
    }
    return o;
  }
  return obj;
}

export function buildJsonLd(d) {
  const base = d.site_url || "https://noppadol.online";
  const key  = (s) => String(s || "").replace(/^\/+/, "");
  const id   = (s) => (s ? `${base}/${key(s)}` : undefined);
  const reg  = d.entities || {};   // ทะเบียนกลาง: คีย์ = path เช่น "person/john-searle"

  // resolve ref (string id | {id,name,type,same_as}) → ฟิลด์ schema (inline > ทะเบียน)
  const ent = (ref, defType) => {
    const r = typeof ref === "string" ? { id: ref } : ref || {};
    const e = reg[key(r.id)] || {};
    return {
      "@type": r.type || e.type || defType,
      "@id": id(r.id),
      name: r.name || e.name,
      sameAs: sameAs(r.same_as || e.sameAs),
    };
  };

  const node = {
    "@context": `${base}/ontology/std-context.jsonld`,
    "@type": TYPE_MAP[d.content_type] || "Article",
    "@id": id(d.slug),
    [d.content_type === "Review" ? "name" : "headline"]: d.title,
    description: d.subtitle || undefined,
    inLanguage: d.lang || "th",
    datePublished: d.date_published || undefined,
    author: {
      "@type": "Person",
      "@id": id(d.author_id),
      name: d.author || (reg[key(d.author_id)] || {}).name,
      sameAs: sameAs(d.author_same_as || (reg[key(d.author_id)] || {}).sameAs),
    },
    publisher: {
      "@type": "Organization",
      "@id": `${base}/#org`,
      name: "Seize the Day",
      sameAs: sameAs(d.org_same_as),
    },
    articleSection: d.dept_en || undefined,
    department: d.department ? `${base}/ns/std#${cap(d.department)}` : undefined,
    timeRequired: d.reading_time ? `PT${parseInt(d.reading_time, 10)}M` : undefined,
  };

  if (d.issue) {
    node.isPartOf = {
      "@type": "PublicationIssue",
      issueNumber: d.issue,
      name: `Seize the Day — ${d.issue_label || ""}`.trim(),
      identifier: d.issue_code || undefined,
    };
  }
  if (d.hero_image) {
    node.image = {
      "@type": "ImageObject",
      url: `${base}/assets/img/${d.issue_dir}/${d.hero_image}`,
      caption: d.hero_caption || undefined,
    };
  }
  if (Array.isArray(d.about) && d.about.length)
    node.about = d.about.map((a) => ent(a, "DefinedTerm"));
  if (Array.isArray(d.mentions) && d.mentions.length)
    node.mentions = d.mentions.map((m) => ent(m, "Thing"));
  if (Array.isArray(d.tags) && d.tags.length) node.keywords = d.tags.join(", ");
  if (Array.isArray(d.related) && d.related.length)
    node.isRelatedTo = d.related.map((r) => ({ "@id": id(r) }));

  if (d.content_type === "Review" && d.review_item) {
    const ri = d.review_item;
    const re = reg[key(ri.id)] || {};
    node.itemReviewed = {
      "@type": ri.type || re.type || "CreativeWork",
      "@id": id(ri.id),
      name: ri.name || re.name,
      sameAs: sameAs(ri.same_as || re.sameAs),
      creator: ri.creator
        ? { "@type": "Person", name: ri.creator, sameAs: sameAs(ri.creator_same_as) }
        : undefined,
    };
    if (d.review_rating)
      node.reviewRating = {
        "@type": "Rating",
        ratingValue: d.review_rating,
        bestRating: d.review_best || 5,
      };
  }

  return JSON.stringify(prune(node), null, 2);
}

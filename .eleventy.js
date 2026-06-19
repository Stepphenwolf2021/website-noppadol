import fs from "node:fs";
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";

export default function (eleventyConfig) {
  // --- Markdown: เปิด {.pullquote} ฯลฯ ผ่าน attrs ---
  const md = markdownIt({ html: true, typographer: false }).use(markdownItAttrs);
  eleventyConfig.setLibrary("md", md);

  // --- ก๊อปไฟล์ static ไปหน้าเว็บตรง ๆ ---
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/ontology": "ontology" });

  // --- ไฟล์/โฟลเดอร์ static ระดับ repo (มีเฉพาะตอน deploy บน repo จริง) ---
  // คงโดเมน + 404 + dashboard เดิมไว้ครบ (ก๊อปเข้า _site ถ้าไฟล์มีอยู่)
  for (const p of ["CNAME", "404.html", "liverpool-success-dashboard", "china-trade-dashboard", "worldcup-2026-dashboard", "japanese-woodworking", "punnawolf"]) {
    if (fs.existsSync(p)) eleventyConfig.addPassthroughCopy(p);
  }

  // --- Collections ---
  // ทุกบทความ (เรียงตามวันที่)
  eleventyConfig.addCollection("articles", (c) =>
    c.getFilteredByGlob("src/content/**/*.md").sort((a, b) =>
      (a.data.date_published || "").localeCompare(b.data.date_published || "")
    )
  );

  // จัดกลุ่มตามฉบับ → ใช้ทำหน้า Back Issues (backlog ข้อ 2)
  eleventyConfig.addCollection("issues", (c) => {
    const byIssue = {};
    for (const item of c.getFilteredByGlob("src/content/**/*.md")) {
      const k = item.data.issue || 0;
      (byIssue[k] = byIssue[k] || []).push(item);
    }
    return Object.entries(byIssue)
      .map(([issue, items]) => ({ issue: Number(issue), items }))
      .sort((a, b) => b.issue - a.issue);
  });

  // จัดกลุ่มตามแผนก → ใช้ทำหน้า department landing (backlog ข้อ 5)
  eleventyConfig.addCollection("departments", (c) => {
    const byDept = {};
    for (const item of c.getFilteredByGlob("src/content/**/*.md")) {
      const k = item.data.department || "misc";
      (byDept[k] = byDept[k] || []).push(item);
    }
    return byDept;
  });

  // --- Filters ---
  // reading_time → "PT7M" (schema.org ISO 8601 duration)
  eleventyConfig.addFilter("iso8601min", (m) => `PT${parseInt(m || 0, 10)}M`);
  // join list ปลอดภัย
  eleventyConfig.addFilter("commaList", (arr) =>
    Array.isArray(arr) ? arr.join(", ") : (arr || "")
  );
  // เลือกบทความที่เป็นปก (featured) หรือชิ้นแรกของฉบับ — ใช้ทำหน้าปก
  eleventyConfig.addFilter("coverOf", (items) =>
    (items || []).find((i) => i.data.featured) || (items || [])[0]
  );

  // ปีพ.ศ. จากปีค.ศ.
  eleventyConfig.addFilter("toBE", (iso) => {
    const y = new Date(iso).getFullYear();
    return Number.isFinite(y) ? y + 543 : "";
  });

  // ---- สร้าง schema.org JSON-LD จาก front matter (ชั้น ontology) ----
  // map content_type → schema.org @type
  const TYPE_MAP = {
    Article: "Article",
    OpinionPiece: "OpinionNewsArticle",
    Review: "Review",
    HowTo: "HowTo",
    CoffeeNote: "Article",
    GardenNote: "Article",
    Note: "Article",
  };
  eleventyConfig.addFilter("buildJsonLd", (d) => {
    const base = d.site_url || "https://noppadol.online";
    const id = (s) => (s ? `${base}/${String(s).replace(/^\/+/, "")}` : undefined);
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
        name: d.author,
      },
      publisher: { "@type": "Organization", "@id": `${base}/#org`, name: "Seize the Day" },
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
    if (Array.isArray(d.about) && d.about.length) {
      node.about = d.about.map((a) => ({
        "@type": "DefinedTerm",
        "@id": id(a.id),
        name: a.name,
      }));
    }
    if (Array.isArray(d.mentions) && d.mentions.length) {
      node.mentions = d.mentions.map((m) => ({
        "@type": m.type || "Thing",
        "@id": id(m.id),
        name: m.name,
      }));
    }
    if (Array.isArray(d.tags) && d.tags.length) node.keywords = d.tags.join(", ");
    if (Array.isArray(d.related) && d.related.length) {
      node.isRelatedTo = d.related.map((r) => ({ "@id": id(r) }));
    }
    if (d.content_type === "Review" && d.review_item) {
      node.itemReviewed = {
        "@type": d.review_item.type || "CreativeWork",
        "@id": id(d.review_item.id),
        name: d.review_item.name,
        creator: d.review_item.creator
          ? { "@type": "Person", name: d.review_item.creator }
          : undefined,
      };
      if (d.review_rating) {
        node.reviewRating = {
          "@type": "Rating",
          ratingValue: d.review_rating,
          bestRating: d.review_best || 5,
        };
      }
    }
    return JSON.stringify(prune(node), null, 2);
  });

  function cap(s) {
    return String(s).charAt(0).toUpperCase() + String(s).slice(1);
  }
  // ตัด key ที่ค่า undefined/ว่าง ออก (recursive)
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

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}

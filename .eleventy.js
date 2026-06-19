import fs from "node:fs";
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import { buildJsonLd } from "./tools/jsonld.mjs";

export default function (eleventyConfig) {
  // --- Markdown: เปิด {.pullquote} ฯลฯ ผ่าน attrs ---
  const md = markdownIt({ html: true, typographer: false }).use(markdownItAttrs);
  eleventyConfig.setLibrary("md", md);

  // --- ก๊อปไฟล์ static ไปหน้าเว็บตรง ๆ ---
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/ontology": "ontology" });

  // --- ไฟล์/โฟลเดอร์ static ระดับ repo (มีเฉพาะตอน deploy บน repo จริง) ---
  // คงโดเมน + 404 + dashboard เดิมไว้ครบ (ก๊อปเข้า _site ถ้าไฟล์มีอยู่)
  for (const p of ["CNAME", "404.html", "liverpool-success-dashboard", "china-trade-dashboard", "punnawolf"]) {
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
  // ปีพ.ศ. จากปีค.ศ.
  eleventyConfig.addFilter("toBE", (iso) => {
    const y = new Date(iso).getFullYear();
    return Number.isFinite(y) ? y + 543 : "";
  });

  // ---- สร้าง schema.org JSON-LD จาก front matter (ชั้น ontology) ----
  // map content_type → schema.org @type
  // ---- ชั้น ontology (schema.org / SEO): logic อยู่ใน tools/jsonld.mjs ----
  eleventyConfig.addFilter("buildJsonLd", buildJsonLd);

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

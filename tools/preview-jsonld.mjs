// พรีวิว: front matter ตัวอย่าง → JSON-LD จริง (ผ่าน filter เดียวกับเว็บ + ทะเบียน entity กลาง)
// รัน: node tools/preview-jsonld.mjs
import { buildJsonLd } from "./jsonld.mjs";
import { readFileSync } from "node:fs";

const reg = JSON.parse(readFileSync(new URL("../src/_data/entities.json", import.meta.url)));
delete reg._comment;

const article = {
  site_url: "https://noppadol.online",
  slug: "critics-ryuichi-sakamoto-last-days",
  title: "Ryuichi Sakamoto: Last Days — หนึ่งชั่วโมงของช่างเสียงผู้ตามหา Purity of Sound",
  subtitle: "สารคดี NHK ที่เผยวิถี shokunin ในนักดนตรีผู้ขัดเกลาเสียงจนวินาทีสุดท้าย",
  lang: "th", content_type: "Review", department: "critics", dept_en: "The Critics",
  issue: 1, issue_label: "มิถุนายน 2569", issue_code: "2569-06", issue_dir: "2569-06",
  date_published: "2026-06-12",
  author: "นพดล วีรกิตติ", author_id: "person/noppadol-weerakitti",
  reading_time: 4,
  review_item: { name: "Ryuichi Sakamoto: Last Days", type: "Movie", creator: "NHK", id: "work/sakamoto-last-days" },
  review_rating: 5, review_best: 5,
  // อ้างด้วย id ล้วน — name + sameAs จะถูกดึงจากทะเบียน entities.json อัตโนมัติ
  about: [ { id: "concept/shokunin" }, { id: "concept/sensory-experience" } ],
  mentions: [ { id: "person/ryuichi-sakamoto" }, { id: "org/nhk" } ],
  tags: ["สารคดี", "ดนตรี", "รีวิว", "shokunin"],
  related: ["annals-ai-creative-workflow-taste"],
  entities: reg,   // ← njk ส่งให้อัตโนมัติบนเว็บจริง
};

const out = buildJsonLd(article);
JSON.parse(out);
console.log(out);
console.error("\n[ok] JSON-LD ถูกต้อง — name/sameAs ของ mentions ดึงจากทะเบียน entities.json");

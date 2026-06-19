// ค่าคงที่ทั้งเว็บ — ใช้ได้ทุก template ผ่านตัวแปร {{ site.* }}
//
// แนวคิด: noppadol.online = พื้นที่บันทึกความคิดและความสนใจส่วนตัว (หลายศาสตร์)
// ไม่เน้นแบรนด์ "Seize the Day" บนหน้าเว็บ — เก็บชื่อนั้นไว้สำหรับ "รวมเล่ม"
// เนื้อหาเป็นหนังสือภายหลัง (ดู `book`)
export default {
  name: "noppadol",
  wordmark: "noppadol·online",
  tagline: "บันทึกความคิดและความสนใจส่วนตัว",
  intro:
    "ที่นี่คือโต๊ะทำงานที่ความสนใจหลายอย่างมาบรรจบกัน บันทึกไว้เพื่อค้นหาความเป็นไปได้ใหม่ๆ ในชีวิต",
  url: "https://noppadol.online",
  orgId: "https://noppadol.online/#org",
  author: {
    name: "นพดล วีรกิตติ",
    id: "person/noppadol-weerakitti",
  },

  // ชื่อสำหรับ "รวมเล่ม" เนื้อหาเป็นหนังสือในอนาคต (ยังไม่โชว์เด่นบนเว็บ)
  book: {
    name: "Seize the Day",
    note: "ชุดบทความคัดสรรที่นำมารวมเล่มเป็นหนังสือ",
  },

  // ── palette navy (modern / clean / minimalist) ──
  base: {
    ink: "#2D3952",
    inkSoft: "#41506E",
    paper: "#FAFBFD",
    muted: "#5A6A83",
    hairline: "#E1E6EF",
  },

  // ── topics: หมวดความสนใจ = node บน knowledge graph ──
  // hue = องศาสีบนวง HSL (สี muted), x/y = ตำแหน่งบน viewBox 900x540 ของ graph,
  // depts = แผนกเนื้อหาที่ป้อนหมวดนี้
  topics: {
    coffee: { th: "กาแฟ", en: "Coffee", hue: 18,  x: 235, y: 140, depts: ["cup"],     blurb: "การคั่ว ดริป รสนิยม และพิธีกรรมประจำวัน" },
    screen: { th: "ดูหนังฟังเพลง", en: "Screen & Sound", hue: 286, x: 470, y: 92,  depts: ["critics"], blurb: "เรื่องเล่า ภาพ และเสียงที่ติดอยู่ในหัว" },
    books:  { th: "หนังสือ", en: "Reading", hue: 212, x: 700, y: 150, depts: [],        blurb: "สิ่งที่อ่าน บันทึก และคิดต่อ" },
    photo:  { th: "ถ่ายภาพ", en: "Photography", hue: 196, x: 792, y: 300, depts: [],     blurb: "การมอง แสง และการหยุดเวลา" },
    living: { th: "เดินทาง · ใช้ชีวิต", en: "Travel & Living", hue: 350, x: 690, y: 438, depts: ["comment"], blurb: "ที่ทาง ผู้คน และข้อสังเกตระหว่างทาง" },
    farm:   { th: "การเกษตร", en: "Growing", hue: 128, x: 455, y: 475, depts: ["garden"], blurb: "ดิน การหมัก และอาหารที่ปลูกเอง" },
    wood:   { th: "งานไม้", en: "Woodworking", hue: 32,  x: 235, y: 430, depts: ["bench"],  blurb: "เครื่องมือ เนื้อไม้ และงานคราฟต์" },
    tech:   { th: "เทคโนโลยี", en: "Technology", hue: 248, x: 108, y: 300, depts: ["annals"], blurb: "เอไอ ความรู้ และวิธีคิดเชิงระบบ" },
  },

  // ── เส้นเชื่อมข้ามศาสตร์บน graph ──
  edges: [
    ["coffee", "screen"], ["coffee", "books"], ["coffee", "wood"], ["coffee", "tech"],
    ["coffee", "farm"], ["screen", "books"], ["books", "tech"],
    ["books", "living"], ["wood", "farm"], ["wood", "tech"], ["wood", "photo"], ["photo", "books"],
    ["photo", "living"], ["photo", "farm"], ["farm", "living"], ["tech", "living"],
  ],

  // คงไว้เพื่อความเข้ากันได้กับหน้า article เดิม (front matter ใช้ department)
  // topic = หมวดที่แผนกนี้สังกัดบน knowledge graph
  departments: {
    comment: { en: "Notes", th: "ทัศนะ", topic: "living" },
    bench:   { en: "The Bench", th: "งานไม้", topic: "wood" },
    cup:     { en: "The Cup", th: "กาแฟ", topic: "coffee" },
    garden:  { en: "The Garden", th: "สวน", topic: "farm" },
    annals:  { en: "Annals", th: "เอไอ & ความรู้", topic: "tech" },
    critics: { en: "The Critics", th: "วิจารณ์", topic: "screen" },
  },
};

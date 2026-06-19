// ค่าคงที่ทั้งเว็บ — ใช้ได้ทุก template ผ่านตัวแปร {{ site.* }}
export default {
  name: "Seize the Day",
  tagline: "นิตยสารออนไลน์รายเดือน",
  url: "https://noppadol.online",
  orgId: "https://noppadol.online/#org",
  org_same_as: [], // โซเชียลของแบรนด์ Seize the Day (เติมเพื่อ brand knowledge panel)
  author: {
    name: "นพดล วีรกิตติ",
    id: "person/noppadol-weerakitti",
    // โปรไฟล์ที่ยืนยันตัวตน (E-E-A-T) — เติม URL จริงเพื่อช่วยสร้าง knowledge panel
    same_as: [
      // "https://www.facebook.com/...",
      // "https://www.linkedin.com/in/...",
    ],
  },
  // สีพื้นฐาน (คงที่ทุกฉบับ) — สีประจำฉบับอยู่ใน <ฉบับ>.11tydata.json
  base: {
    ink: "#171513",
    paper: "#FAF7F1",
    espresso: "#4A3327",
    hairline: "#D8D2C6",
  },
  departments: {
    comment: { en: "The Comment", th: "ทัศนะ" },
    bench: { en: "The Bench", th: "งานไม้" },
    cup: { en: "The Cup", th: "กาแฟ" },
    garden: { en: "The Garden", th: "สวน" },
    annals: { en: "Annals of Intelligence", th: "เอไอ & ความรู้" },
    critics: { en: "The Critics", th: "วิจารณ์" },
  },
};

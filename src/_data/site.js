// ค่าคงที่ทั้งเว็บ — ใช้ได้ทุก template ผ่านตัวแปร {{ site.* }}
export default {
  name: "Seize the Day",
  tagline: "นิตยสารออนไลน์รายเดือน",
  url: "https://noppadol.online",
  orgId: "https://noppadol.online/#org",
  author: {
    name: "นพดล วีรกิตติ",
    id: "person/noppadol-weerakitti",
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

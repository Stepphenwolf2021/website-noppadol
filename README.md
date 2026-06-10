# noppadol-online — Seize the Day

นิตยสารออนไลน์รายเดือน สร้างด้วย [Eleventy](https://www.11ty.dev/) เนื้อหาเขียนใน Scrivener → compile เป็น Markdown → build เป็นเว็บ + Knowledge Graph

## รันในเครื่อง

```bash
npm install
npm start            # เปิด http://localhost:8080 (live reload)
```

## build เว็บ + กราฟ

```bash
npm run build        # → _site/  (เว็บ) + _site/knowledge-graph.jsonld (กราฟรวม)
```

## โครงสร้าง

```
src/
  _data/site.js                 ค่าคงที่ทั้งเว็บ (masthead, palette ฐาน)
  _includes/
    layouts/base.njk            <head>, ฟอนต์, grain, utility bar, set palette ต่อฉบับ
    layouts/article.njk         หน้าบทความ (เดิมคือ article.html)
    partials/jsonld.njk         พ่น schema.org JSON-LD จาก front matter
  content/<ฉบับ>/               หนึ่งโฟลเดอร์ = หนึ่งฉบับ
    <ฉบับ>.11tydata.json        palette + ค่า default ของฉบับนั้น
    *.md                        บทความ (compile จาก Scrivener)
  assets/css/seize.css          design system
  assets/img/<ฉบับ>/            ภาพต่อฉบับ
  ontology/std-context.jsonld   @context กลางของ JSON-LD
tools/build-graph.js            รวม front matter ทุกไฟล์ → knowledge-graph.jsonld
```

## เพิ่มบทความใหม่

1. ใน Scrivener: `New From Template` เลือกแผนก → เขียน → compile เป็น `.md`
   (ดู `templates/` และ `docs/WORKFLOW-scrivener-to-web.md`)
2. วางไฟล์ใน `src/content/<ฉบับ>/`
3. `git commit && git push` → GitHub Actions build + deploy เอง

## เพิ่มฉบับใหม่

สร้างโฟลเดอร์ `src/content/<ปีพ.ศ.-เดือน>/` + ไฟล์ `<ชื่อ>.11tydata.json`
กำหนด palette 3 สีของฉบับ แล้ววางบทความ — หน้า Back Issues อัปเดตเอง

## หมายเหตุ deploy บน repo นี้

- โดเมน **noppadol.online** (ไฟล์ `CNAME`) — คงเดิม
- โปรเจกต์เดิมยัง live ครบ: `/liverpool-success-dashboard/`, `/china-trade-dashboard/`
  (Eleventy ก๊อปผ่านโดยไม่ประมวลผล ดู `.eleventyignore` + passthrough ใน `.eleventy.js`)
- หน้าแรก `/` = นิตยสาร Seize the Day (แทน redirect เดิม)
- การ deploy ใช้ GitHub Actions (`.github/workflows/deploy.yml`) — ดู `DEPLOY.md`

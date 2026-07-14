# HANDOFF — Demo Knowledge-Graph View

วันที่: 2026-07-14 · ขอบเขต: เพิ่มมุมมอง "กราฟความรู้" เข้าไปในหน้า static demo (`demo/index.html`)

## ทำอะไรไป
- เพิ่มแท็บสลับมุมมองบน header: **▦ ตาราง** (ของเดิม) / **🕸 กราฟความรู้** (ใหม่)
- กราฟสร้างจาก `books-data.js` เดิม (source of truth ไม่แตะ) — มองข้อมูล 70 เล่มเป็น knowledge graph
- ฟังก์ชันเดิมคงครบ: ค้นหา, กรองหมวด (pills), การ์ด, sidebar รายละเอียด

## โมเดลกราฟ (ตรงกับ ontology จริง)
สร้าง node/edge จากฟิลด์ที่มีอยู่ ให้ตรง label + relationship ของระบบจริง:

| node type (demo) | ontology label | ที่มา | สี |
|---|---|---|---|
| Book | `:Artifact:Book` | 1 โหนด/เล่ม (identity = ISBN-13) | น้ำเงิน `#465a78` |
| Person | `:Person` | `authors[]` | ส้ม `#c66a4b` |
| Org | `:Organization` | `publisher` | ม่วง `#7a6bb0` |
| Concept | `:Concept` | `cats[]` | ทอง `#d1a23a` |

edges: `AUTHORED_BY`, `PUBLISHED_BY`, `ABOUT` — สรุป **211 โหนด · 225 ความสัมพันธ์** (Book 70 / Person 81 / Org 53 / Concept 7 · ไม่มีโหนดลอย · Concept เป็น hub)

## การตัดสินใจ
- **ไม่พึ่ง CDN** — เขียน force-directed graph เองบน `<canvas>` (repulsion O(n²) + spring + gravity, ~211 โหนดลื่นที่ 60fps) → static demo ยังเป็นไฟล์เดี่ยว ไม่มี dependency ภายนอก ไม่มีปัญหาเวอร์ชัน/บล็อก
- ใช้เฉพาะฟิลด์ที่ demo มีจริง (ไม่ยัด LCSH concept/claims จาก Aura) เพื่อให้ demo ซื่อตรงกับข้อมูลสาธารณะ 70 เล่ม — ถ้าจะโชว์ claims/evidence ต้อง export เพิ่มจาก Aura ทีหลัง
- คลิกโหนดหนังสือ → เปิด sidebar เดิม · คลิกโหนด Person/Org/Concept → panel ใหม่ลิสต์หนังสือที่เชื่อมอยู่ (คลิกต่อไปที่เล่มได้)

## Interaction
ลากพื้นหลัง=เลื่อน · สกรอลล์/ปุ่ม +−⤢=ซูม/จัดพอดี · ลากโหนด=จัดวาง (pin) · hover=tooltip+ไฮไลต์เพื่อนบ้าน · คลิก legend=ซ่อน/แสดงประเภทโหนด · ช่องค้นหาในโหมดกราฟ=เน้นวงหนังสือที่ตรงคำค้น · รองรับ touch

## ตรวจสอบแล้ว
- `node --check` ผ่าน · logic test นับ node/edge ตรง · รันจริงบน jsdom (mock canvas 2d): grid 70 การ์ด, สลับมุมมอง, loop วาดจริง 7040 ops, hover/legend-toggle/search — **ไม่มี runtime error**
- ยังไม่ได้ทดสอบภาพจริงในเบราว์เซอร์ (extension บล็อก `file://`, sandbox โหลด chromium ไม่ได้) → แนะนำเปิด `demo/index.html` ดูด้วยตาก่อน push

## Deploy
ยังไม่ขึ้น production — ต้อง commit + push โฟลเดอร์ `personal-library/` เข้า repo `website-noppadol` (งานค้าง §5.1 ใน HANDOFF หลัก) แล้ว Pages จะอัปเดตที่ `noppadol.online/personal-library/demo/`

## อัปเดต 2 (2026-07-14): เติมข้อมูลจริงจาก dataset ต้นทาง
เดิมกราฟใช้เฉพาะฟิลด์บาง ๆ (ผู้เขียน/สำนักพิมพ์/หมวดกว้าง 7) → เติมข้อมูลบรรณานุกรมเชิงลึกจาก
`personal-assets/books/lc-enrichment-2026-07-14.json` (LC record จริง) เข้า `books-data.js`:

- ฟิลด์ใหม่ต่อเล่ม: `subjects[]` (LCSH), `ddc`, `lcc`, `lccn`, `oclc`, `extent` · เติม `pages` ที่ขาดจาก extent (ครบ 59/70)
- **42/70 เล่มมี LCSH subjects** (140 หัวเรื่อง เฉลี่ย 3.9/เล่ม)
- ชั้นโหนดใหม่ **หัวเรื่อง (Subject, สี teal)** — ใส่เฉพาะ subject ที่เชื่อม **≥2 เล่ม** (10 สะพานข้ามหมวด: History, Coffee, Artificial intelligence, Coffee brewing, Fermentation, Fermented foods, Tea, Biotechnology, Social aspects, Psychological aspects) → กราฟสะอาดแต่โชว์ความเชื่อมโยงเชิงหัวข้อจริง
- กราฟรวม **221 โหนด · 257 ความสัมพันธ์** · sidebar หนังสือแสดง LCSH ครบ + DDC/LC Class/LCCN/extent · legend กดซ่อน/แสดงชั้นหัวเรื่องได้
- ตัดสินใจ: subject ที่ปรากฏเล่มเดียว (leaf) ไม่ขึ้นเป็นโหนดในกราฟ (กันรก) แต่แสดงครบใน sidebar · ใช้ dataset ต้นทาง (source of truth) ไม่ re-fetch API

## ต่อยอดได้
- ลดเกณฑ์ subject bridge หรือทำ subject cluster ย่อย (LCSH → broader term)
- เพิ่ม edge Person–Concept (author เชี่ยวชาญหมวดไหน) หรือ co-authorship
- export subgraph จาก Aura (claims/evidence) มาเป็น `graph-data.js` แยก เพื่อโชว์ epistemology layer จริง

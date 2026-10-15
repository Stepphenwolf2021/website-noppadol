# Knowledge Atlas — 15 October 2026

หน้าแรกใช้เจ็ดหมวดที่เจ้าของเลือก ภาพกลางเป็น editorial illustration ตาม Seize the Day Illustration ข้อความอังกฤษ lowercase/sans-serif และชื่อ universe แสดงเมื่อ hover/focus บนภาพ; อุปกรณ์ไม่มี hover แสดงชื่อไว้ให้อ่านได้ การกดวงหมวดเป็นลิงก์ HTML ปกติ ใช้งานได้แม้ปิด JavaScript

หน้าหมวดใช้ editorial layout กับแผนที่จุดแนวตั้งด้านขวาตามแบบที่เลือก รูปและข้อความบทความมาจากเนื้อหาสาธารณะเดิมเท่านั้น หมวดว่างแสดงว่าไม่มีบทความ ไม่สร้างบทความสมมติแทนตัวอย่าง mockup

## Data and identity

`src/_data/atlas.js` เป็นข้อมูล navigation: stable topic IDs, URLs, source topic mappings, editorial-domain mappings และ CollectionPage/hasPart JSON-LD. ไม่เปลี่ยนURIเดิมของ interest map หรือคำใน `semantic.json` และไม่ใช้เส้นนำทางเป็น skos:related หรือข้อกล่าวอ้างข้ามศาสตร์โดยไม่มีหลักฐาน เส้นsidebarแสดงmembership;บทความอ้างconceptIdsเดิม ส่วนการตีความ cross-domain แบบละเอียดรอเนื้อหาที่ระบุจริง

Pipeline scope: learning_content, stage3 navigation projection และ stage6 public traversal. Dependencies: public semantic1.1.1/CV1.2.0, editorial.json และpublished content collections. Purpose: ผู้อ่านเลือกความสนใจ→อ่านเนื้อหา→ตามคำที่เกี่ยวข้องและกลับสู่แผนที่ได้ โดยไม่เปิดprivate evidence. `/atlas/` อธิบายfoundationและเชื่อม `/atlas.json`, `/ontology/`, `/knowledge-graph.jsonld`.

## Routes and assets

คง `/records/`, `/notes/*`, `/knowledge/*`, `/ontology/`, `/studio/`, `/gallery/` และdashboardเดิม. หน้า `/woodworking/` ใช้templateใหม่;หมวดอื่นอยู่ `/topics/<id>/`. ไม่มีการนำ93โพสต์หรือคลังPKMส่วนตัวเข้าเว็บ

ภาพ `/assets/atlas/seize-the-day.webp` จากภาพเจ้าของเลือก และ `woodworking.webp` ภาพกบเชิงillustrativeสร้างใหม่ตามskill;ไม่ใช่ภาพยืนยันรุ่นสินค้า. metadataอยู่provenance.json;ไม่มีprivate source paths. Original illustration files remain unchanged outside public repo.

## Validation / preview

ใช้ Node20+ (runtimeปัจจุบันที่ทดสอบรองรับEleventy3/sharp). `npm run build`, `npm run test:atlas`, `npm run test:domains`, `npm run test:gallery`, `npm run test:studio`. Preview: serve `_site` ด้วยlocalHTTPserver. `_site` เป็นgenerated output ไม่commit. Deployใช้GitHub Pages workflowเดิมเมื่อmerge/pushเข้าmain;งานbranch/PRยังไม่publish

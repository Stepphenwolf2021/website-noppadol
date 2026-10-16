# Knowledge Atlas — 15 October 2026

หน้าแรกใช้แปดหมวดที่เจ้าของเลือก ภาพกลางเป็น editorial illustration ตาม Seize the Day Illustration ข้อความอังกฤษ lowercase/sans-serif และชื่อ universe แสดงเมื่อ hover/focus บนภาพ; อุปกรณ์ไม่มี hover แสดงชื่อไว้ให้อ่านได้ การกดวงหมวดเป็นลิงก์ HTML ปกติ ใช้งานได้แม้ปิด JavaScript

หน้าหมวดใช้ editorial layout กับแผนที่จุดแนวตั้งด้านขวาตามแบบที่เลือก รูปและข้อความบทความมาจากเนื้อหาสาธารณะเดิมเท่านั้น หมวดว่างแสดงว่าไม่มีบทความ ไม่สร้างบทความสมมติแทนตัวอย่าง mockup

## Data and identity

`src/_data/atlas.js` เป็นข้อมูล navigation: stable topic IDs, URLs, source topic mappings, editorial-domain mappings และ CollectionPage/hasPart JSON-LD. ไม่เปลี่ยนURIเดิมของ interest map หรือคำใน `semantic.json` และไม่ใช้เส้นนำทางเป็น skos:related หรือข้อกล่าวอ้างข้ามศาสตร์โดยไม่มีหลักฐาน เส้นsidebarแสดงmembership;บทความอ้างconceptIdsเดิม ส่วนการตีความ cross-domain แบบละเอียดรอเนื้อหาที่ระบุจริง

Pipeline scope: learning_content, stage3 navigation projection และ stage6 public traversal. Dependencies: public semantic1.1.1/CV1.2.0, editorial.json และpublished content collections. Purpose: ผู้อ่านเลือกความสนใจ→อ่านเนื้อหา→ตามคำที่เกี่ยวข้องและกลับสู่แผนที่ได้ โดยไม่เปิดprivate evidence. `/atlas/` อธิบายfoundationและเชื่อม `/atlas.json`, `/ontology/`, `/knowledge-graph.jsonld`.

## Routes and assets

คง `/records/`, `/notes/*`, `/knowledge/*`, `/ontology/`, `/studio/`, `/gallery/` และdashboardเดิม. หน้า `/woodworking/` ใช้templateใหม่;หมวดอื่นอยู่ `/topics/<id>/`. ไม่มีการนำ93โพสต์หรือคลังPKMส่วนตัวเข้าเว็บ

ภาพ `/assets/atlas/seize-the-day.webp` จากภาพเจ้าของเลือก และ `woodworking.webp` ภาพกบเชิงillustrativeสร้างใหม่ตามskill;ไม่ใช่ภาพยืนยันรุ่นสินค้า. metadataอยู่provenance.json;ไม่มีprivate source paths. Original illustration files remain unchanged outside public repo.

## Validation / preview

ใช้ Node20+ (runtimeปัจจุบันที่ทดสอบรองรับEleventy3/sharp). `npm run build`, `npm run test:atlas`, `npm run test:domains`, `npm run test:gallery`, `npm run test:studio`. Preview: serve `_site` ด้วยlocalHTTPserver. `_site` เป็นgenerated output ไม่commit. Deployใช้GitHub Pages workflowเดิมเมื่อmerge/pushเข้าmain;งานbranch/PRยังไม่publish

## Photography — 16 October 2026

เพิ่ม navigation ID `photography` / การถ่ายภาพ ที่ `/topics/photography/` เป็นหมวดที่ 8 โดย reuse semantic identity เดิม `https://noppadol.online/topic/photo` ผ่าน legacy mapping `photo`. ไม่สร้าง concept ซ้ำหรือแก้ URI เดิม; photography navigation ไม่ใช่ asset catalog และไม่เผยแพร่ภาพ Gallery อัตโนมัติ. Interest Map เดิมมี Photography อยู่แล้วใน SKOS/JSON-LD. หมวดแสดงเนื้อหาสาธารณะเดิมที่ติด topic photo หรือสถานะว่างตามจริง.

## Ontology hover hints — 16 October 2026

Hover/focus on each desktop topic zooms its circle to 116% and reveals three concentric SVG rings. Text uses rgba(0,0,0,.3); rings show public vocabulary examples, metadata properties, and existing InterestMap types. Domain terms come from semantic.json; other topic labels/mappings come from interestGraph.json. This UI view adds no assertions or approval status to the graph. Keyboard focus uses the same effect; reduced-motion disables transitions. Small screens retain direct category links. Ring width adapts to available horizontal space.

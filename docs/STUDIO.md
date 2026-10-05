# Woodworking Ontology Studio

เปิด `/studio/` บน noppadol.online เป็นเว็บแอป static สำหรับเจ้าของ ใช้ IndexedDB ในเบราว์เซอร์ ไม่มี backend/login/cloud sync ตามที่เจ้าของเลือกวันที่ 5 ตุลาคม 2026

- เพิ่ม แก้ไข ลบ Sources/Terms/Metadata/Crosswalk/Use cases/Schemes/Hierarchy/Related/Mappings/Collections/CQ/Classes/Properties/Constraints/Individuals/Triples/Queries/Content
- ช่องแก้ไขบันทึกอัตโนมัติระหว่างพิมพ์; สถานะด้านบนยืนยันเมื่อ transaction บันทึกสำเร็จ
- ปุ่มย้อนกลับเก็บ 30 การแก้ไขใน session นี้ ดาวน์โหลดไฟล์สำรองก่อนล้างข้อมูลเบราว์เซอร์/ย้ายเครื่อง/เปลี่ยนโดเมน
- Import ตรวจรูปแบบก่อนแทน workspace ย้อนกลับได้ภายใน session; export ZIP มี project.json, RDF Turtle/JSON-LD, metadata, CSV, SHACL, queries, Markdown, manifest พร้อม SHA256
- `website/content.json` เลือกเฉพาะร่าง public + ready และไม่รวม source references; ไม่มีการ publish อัตโนมัติ
- Structural checklist ไม่ใช่ SHACL/SPARQL/RDFS engine หรือ human semantic approval กราฟ RDF เป็น subset; JSON สำรองเก็บ provenance/review/editorial fields ทั้งหมด
- ID รายการใหม่เป็น draft UUID ใน workspace ไม่ใช่ AST allocator ไม่เขียน registry/raw/Scrivener
- Seed ใช้โครงคำศัพท์/metadata ปัจจุบัน ไม่ใส่ทะเบียนส่วนตัว ข้อมูลที่ผู้ใช้นำเข้าอยู่เฉพาะ origin/browser นี้
- เว็บไซต์เสิร์ฟโค้ดแอปต่อสาธารณะ; workspace ของเจ้าของไม่อยู่ใน repo/server ไม่ได้ซ่อนด้วย login และไม่ส่งข้อมูลไป backend

ทดสอบ: `npm run test:studio`; build กับ Eleventy ตามเดิม

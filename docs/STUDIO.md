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

## Taxonomy layout (20261005-2)
Stage 3 provides a use-case table, collapsible coverage model and scheme-grouped concept tree with editable broader concept, scheme, definition and Is-a rationale. The tree displays concept labels, retaining legacy relation IDs. Parent options exclude self and descendants. Definitions edit the same CV records used by export.

Six woodworking scenarios are explicitly simulated and start with Done unchecked. Done records the owner's scenario trial, separately from semantic review. Existing browser workspaces receive missing scenario IDs once; edited rows are preserved, and subsequently deleted examples are not restored. No stored workspace is replaced by the new seed. Scheme titles already edited by the owner remain unchanged.

## Thesaurus and Ontology practice (20261005-3)
Thesaurus has four editable simulated use cases and a reading collection. Ontology has five scenarios organized by CBox/TBox/ABox/Check, with three competency questions and query files. Existing owner records, review state and semantic relations are preserved; migrations append missing example IDs once, preserving edits and later deletions. Related-concept lists display names instead of relation IDs.

Exported `examples/woodworking-demo.ttl` contains synthetic objects and events, separately from the workspace knowledge graph and personal inventory. `examples/use-cases.json` retains edited scenarios and `examples/expected-results.json` records the workspace's current expected query bindings. Run the queries with an external SPARQL engine; the browser checklist does not run queries. After schema/query edits, reassess expected results. Done means the owner tried the scenario, not semantic approval.

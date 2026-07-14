# Personal Library

Home library on a knowledge graph — จัดการหนังสือ (และสื่ออื่นผ่าน extension) บน Neo4j
เพิ่มหนังสือจาก **ภาพถ่ายปก / ISBN / ชื่อเรื่อง** แล้วระบบดึงข้อมูลบรรณานุกรมมาตรฐานให้อัตโนมัติ

**[▶ Live Demo (static)](./demo/index.html)** — ตัวอย่างข้อมูล 70 เล่ม ค้นหา/กรองหมวด/ดูรายละเอียดได้จริง

## Architecture

```
ภาพปก/ISBN → AI identify (title+author เท่านั้น) → bibliographic lookup
   Library of Congress SRU (หลัก) → Open Library (fallback) → manual
→ Neo4j knowledge graph  (:Artifact:Book, AUTHORED_BY, PUBLISHED_BY, ABOUT, SHELVED_AT)
→ FastAPI (webapp/app.py, port 8700) → SPA (webapp/static/index.html)
```

หลักการ: ภาพ = ตัวระบุตัวตน ไม่ใช่แหล่งข้อมูล · identity = ISBN-13 · ทุกการเขียน idempotent
· entity (คน/สำนักพิมพ์/หมวด/สถานที่) แชร์ร่วมทุกชนิดสื่อ — พร้อมรองรับ extension (แผ่นเสียง, CD, DVD, ไฟล์)

## Run (full version)

```bash
cd webapp
pip3 install -r requirements.txt
export NEO4J_URI=neo4j+s://<id>.databases.neo4j.io NEO4J_USER=<id> NEO4J_PASSWORD=... NEO4J_DATABASE=<id>
uvicorn app:app --host 0.0.0.0 --port 8700
```

- ต้องมี Neo4j (Aura free tier พอ) — โหลด schema ตามเอกสารในโปรเจกต์หลัก
- Deploy ถาวรบน Linux: ดู `webapp/library-webapp.service` (systemd)
- Security: scrypt password, session token server-side, TOTP 2FA, API keys เข้ารหัส Fernet (ดู `webapp/security.py`)

## โครงสร้าง

| path | คือ |
|---|---|
| `webapp/` | ระบบจริง (FastAPI + Neo4j + SPA) |
| `demo/` | static demo สำหรับ GitHub Pages — ไม่มี backend, ข้อมูลบรรณานุกรมสาธารณะ 70 เล่ม |

> Demo หน้านี้แสดงเฉพาะโหมดอ่าน ระบบจริงมี: เพิ่ม/แก้ไข/ยืม-คืน/จำหน่ายออก, เพิ่มจากภาพถ่าย, enrich ข้อมูลผู้เขียน, กราฟความสัมพันธ์, ผู้ใช้หลายคน + 2FA

---
© NeoGens · part of the [personal knowledge-graph platform](https://noppadol.online)

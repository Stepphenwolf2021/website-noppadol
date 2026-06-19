# DEPLOY — ตั้ง GitHub Actions ให้ noppadol.online

โฟลเดอร์นี้คือ repo `website-noppadol` ที่เตรียมพร้อมแล้ว:
โคลนจริง + git history เดิม + **commit ทำให้เรียบร้อยแล้ว** (author: Noppadol <noppadol@neogens.co>)
สลับเป็นนิตยสาร Eleventy + เก็บ dashboard เดิมครบ — เหลือแค่ **push + เปิด Pages**

---

## ขั้นที่ 1 — push (commit ทำให้แล้ว)

เปิด Terminal:

```bash
cd "website-noppadol-deploy"
git log --oneline -1      # ควรเห็น: Switch site to Seize the Day magazine ...
git push origin main
```

> ถ้า push ถามรหัส/ปฏิเสธสิทธิ์ — ต้องยืนยันตัวตนด้วยบัญชี GitHub (Stepphenwolf2021):
> • HTTPS: ใช้ **Personal Access Token** แทนรหัสผ่าน
> • หรือเปิดโฟลเดอร์นี้ใน **GitHub Desktop** → กด **Push origin** (ง่ายสุด)

---

## ขั้นที่ 2 — เปิด Pages ให้ build ด้วย Actions (ครั้งเดียว)

1. repo บน GitHub → **Settings ▸ Pages**
2. **Build and deployment ▸ Source** → เลือก **GitHub Actions**
3. Custom domain `noppadol.online` มีอยู่แล้ว (CNAME) — ไม่ต้องแตะ

หลัง push workflow `Build & Deploy` จะรันเอง (แท็บ **Actions**)
เสร็จแล้ว noppadol.online = นิตยสาร · dashboard ยังอยู่ที่ path เดิม

---

## รอบถัดไป (เพิ่มบทความ)

```bash
# วางไฟล์ .md จาก Scrivener ลง src/content/<ฉบับ>/
git add -A && git commit -m "เพิ่มบทความ X" && git push
```

---

## สิ่งที่คงไว้ / เปลี่ยน

| คงไว้ | เปลี่ยน |
|---|---|
| CNAME (noppadol.online) | ลบ index.html เดิม (redirect) |
| liverpool-success-dashboard/ | หน้าแรก / = นิตยสาร |
| china-trade-dashboard/ | เพิ่ม Eleventy + workflow deploy |
| 404.html, .gitattributes | |

## ทดสอบในเครื่องก่อน push (ถ้าต้องการ)

```bash
npm install
npm start        # http://localhost:8080
```

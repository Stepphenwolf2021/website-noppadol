# DEPLOY — ตั้ง GitHub Actions ให้ noppadol.online

โฟลเดอร์นี้ **คือ repo `website-noppadol` ที่เตรียมพร้อมแล้ว** (โคลนจริง + git history เดิม +
สลับเป็นนิตยสาร Eleventy + เก็บ dashboard เดิมไว้ครบ) เหลือแค่ 3 ขั้นตอน

---

## ขั้นที่ 1 — push ขึ้น GitHub

เปิด Terminal แล้ววางทีละบรรทัด (อยู่ในโฟลเดอร์นี้):

```bash
cd "website-noppadol-ready"
git status                 # ดูว่าจะเปลี่ยนอะไร (ของถูก stage ไว้แล้ว)
git commit -m "Switch site to Seize the Day (Eleventy); keep dashboards & domain"
git push origin main
```

> ถ้า `git push` ถามรหัส/ปฏิเสธสิทธิ์: ใช้บัญชี GitHub ของคุณ (Stepphenwolf2021)
> — ถ้าใช้ HTTPS ต้องใช้ **Personal Access Token** แทนรหัสผ่าน
> — หรือเปิดโฟลเดอร์นี้ใน **GitHub Desktop** แล้วกด Commit → Push (ง่ายสุด ไม่ต้องพิมพ์คำสั่ง)

---

## ขั้นที่ 2 — เปิด Pages ให้ build ด้วย Actions (ทำครั้งเดียว)

repo เดิม serve ไฟล์ตรง ๆ ต้องสลับมาใช้ Actions:

1. ไปที่ **Settings ▸ Pages** ของ repo
2. หัวข้อ **Build and deployment ▸ Source** → เลือก **GitHub Actions**
3. (Custom domain `noppadol.online` มีอยู่แล้วจาก CNAME — ไม่ต้องแตะ)

หลัง push ครั้งแรก workflow `Build & Deploy` จะรันเอง (ดูที่แท็บ **Actions**)
เสร็จแล้ว noppadol.online จะแสดงนิตยสาร — dashboard ยังอยู่ที่ path เดิม

---

## ขั้นที่ 3 — รอบถัดไป (เพิ่มบทความ)

```bash
# วางไฟล์ .md ที่ compile จาก Scrivener ลง src/content/<ฉบับ>/
git add -A && git commit -m "เพิ่มบทความ X" && git push
```

Actions จะ build + deploy ให้เองทุกครั้ง ไม่ต้องทำมือ

---

## สิ่งที่เปลี่ยน / สิ่งที่คงไว้

| คงไว้ (ไม่แตะ) | เปลี่ยน |
|---|---|
| `CNAME` (noppadol.online) | ลบ `index.html` เดิม (redirect) |
| `liverpool-success-dashboard/` | หน้าแรก `/` = นิตยสาร |
| `china-trade-dashboard/` | เพิ่มระบบ Eleventy (`src/`, `.eleventy.js`, `tools/`) |
| `404.html`, `.gitattributes` | เพิ่ม workflow `.github/workflows/deploy.yml` |

## ทดสอบในเครื่องก่อน push (ถ้าต้องการ)

```bash
npm install
npm start        # http://localhost:8080
```

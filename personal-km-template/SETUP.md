# 📖 Personal Knowledge Management Web Template — Setup & Branding Manual

English and Thai instructions on how to customize, seed, style, and deploy this Personal Knowledge Management (Personal KM) Boilerplate Template.

---

## 🇹🇭 คู่มือภาษาไทย (Thai Manual)

ยินดีต้อนรับสู่ **Personal KM Web Boilerplate** เทมเพลตสำหรับสร้างเว็บจัดการความรู้ส่วนตัวพร้อมกราฟความสัมพันธ์ระดับพรีเมียม (คล้าย Obsidian) ตัวเว็บพัฒนาขึ้นด้วย HTML/CSS/JS (Vanilla) ทำงานแบบ Client-Side 100% บันทึกข้อมูลแบบออฟไลน์/ออนเซสชันปลอดภัยในเบราว์เซอร์ของแต่ละคน (ผ่าน LocalStorage และ IndexedDB) และพร้อมอัปโหลดขึ้นเซิร์ฟเวอร์แบบ Static (เช่น GitHub Pages) ได้ทันที

### 1. วิธีติดตั้งและเปิดใช้งานในเครื่องคอมพิวเตอร์ (Quick Start)
1. เปิดโฟลเดอร์นี้ใน Terminal หรือ Command Prompt
2. รันคำสั่งติดตั้งตัวช่วยเปิดเซิร์ฟเวอร์จำลอง:
   ```bash
   npm install
   ```
3. รันตัวเซิร์ฟเวอร์ทดสอบด้วยคำสั่ง:
   ```bash
   npm start
   ```
4. เปิดเว็บเบราว์เซอร์แล้วเข้าไปที่ `http://localhost:3000` (หรือตามพอร์ตที่ระบุในหน้าจอ)

---

### 2. วิธีตั้งค่าข้อมูลและแบรนดิ้ง (Branding & Config)
ผู้ซื้อเทมเพลตหรือนักพัฒนาสามารถตั้งค่าเว็บเพื่อเปลี่ยนธีมและเนื้อหาไปยังศาสตร์ด้านอื่น ๆ (เช่น กาแฟ, กีฬา, งานโปรแกรมมิ่ง) ได้ง่าย ๆ โดยไม่ต้องเขียนโค้ดหลักใหม่ ผ่านการแก้ไขไฟล์ในโฟลเดอร์ `data/`:

* **`data/config.json`**: ตั้งชื่อระบบ แบรนด์ โลโก้ และข้อความหลักของเว็บ
  * `siteTitle`: ชื่อเว็บไซต์ที่จะแสดงในหน้าต่างเบราว์เซอร์และหัวข้อหน้าเว็บ
  * `siteSubtitle`: คำอธิบายย่อยของระบบ
  * `logoName`: ข้อความย่อที่จะแสดงที่สัญลักษณ์โลโก้มุมซ้ายบน (จำกัด 4 ตัวอักษรแรกเพื่อความสวยงามของ Layout)
  * `rootNodeLabel`: ชื่อข้อความบนโหนดแกนกลางที่เป็นรากของกราฟความรู้ (เช่น "Daiku Hub" หรือ "Knowledge Root")
  * `ontologyContextUrl`: URL พื้นฐานของโครงสร้างคลังความรู้ JSON-LD เพื่อประสิทธิภาพด้าน SEO

* **`data/categories.json`**: ระบุหมวดหมู่ที่สอดคล้องกับหัวเรื่องของคลังความรู้นั้น ๆ โดยกำหนดรูปแบบดังนี้:
  ```json
  [
    { "id": "general", "name": "ความรู้ทั่วไป" },
    { "id": "tools", "name": "เครื่องมือและแอปพลิเคชัน" }
  ]
  ```

* **`data/resources.json`**: บรรจุข้อมูลทรัพยากรตั้งต้น (Seed Resources) ที่ต้องการให้ผู้ใช้งานเห็นเป็นตัวอย่างทันทีที่เปิดเว็บครั้งแรก สามารถกำหนดฟิลด์ประเภท รูปแบบ ลิงก์ และแท็กที่เกี่ยวข้องได้

---

### 3. การเปลี่ยนสีสันและธีม (Custom CSS variables)
หากต้องการเปลี่ยนเฉดสี โทนสี หรือฟอนต์ของเว็บไซต์ ให้เปิดไฟล์ [index.css](file:///Users/noppadolweerakitti/Library/Mobile%20Documents/com~apple~CloudDocs/2026/antigravity/woodworking%20kb/personal-km-template/index.css) และแก้ไขตัวแปร CSS `:root` (สำหรับธีมมืด) และ `[data-theme="light"]` (สำหรับธีมสว่าง):
* `--bg-color`: สีพื้นหลังของเว็บไซต์
* `--accent`: สีเน้นหลักของปุ่มและขอบโหนดกราฟที่ถูกโฟกัส
* `--panel-bg`: สีพื้นหลังของกล่องควบคุมและแถบข้าง
* `--font-sans`: กำหนดตระกูลฟอนต์ที่ต้องการใช้งาน

---

### 4. ระบบการสำรองและกู้คืนข้อมูล (Export & Import Backups)
เทมเพลตมาพร้อมกับหน้าต่าง **⚙️ Settings** ในส่วนหัวควบคุมการสำรองข้อมูล:
* **Export Workspace**: ดาวน์โหลดข้อมูลคลังความรู้ทั้งหมด (หมวดหมู่ ทรัพยากร รายการโปรด และคอลเลกชันที่ผู้ใช้ปรับแต่งเอง) ออกมาเป็นไฟล์ `.json` เก็บไว้ในเครื่องคอมพิวเตอร์ได้ทันที
* **Import Workspace**: กู้คืนข้อมูลด้วยการคลิกหรือลากไฟล์ `.json` ที่เคยสำรองไว้มาวาง (Drag & Drop) ในบริเวณ Drop zone หน้าเว็บจะอัปเดตข้อมูลและรีโหลดตัวเองโดยอัตโนมัติ
* **Factory Reset**: ล้างข้อมูลที่ปรับแต่งเองทั้งหมดในเบราว์เซอร์ รวมถึงไฟล์แนบที่อัปโหลดไว้ใน IndexedDB เพื่อกลับไปใช้งานข้อมูลเริ่มต้นจากไฟล์ JSON ในเซิร์ฟเวอร์

---

### 5. วิธีนำขึ้นออนไลน์ (Deployment)
เนื่องจากเป็นเว็บแบบ Static หน้าเดียว จึงไม่มีขั้นตอนยุ่งยากในการ Deploy:
1. อัปโหลดโค้ดทั้งหมดขึ้น **GitHub Repository**
2. ไปที่แท็บ **Settings ▸ Pages** ในหน้า Repository ของคุณ
3. ในส่วนของ **Build and deployment ▸ Source** ให้เลือกเป็น **Deploy from a branch** จากนั้นเลือกกิ่งหลัก (เช่น `main` หรือ `master`) และโฟลเดอร์ราก `/`
4. กดบันทึก รอรับ URL เว็บไซต์ของคุณได้ทันที!

---
---

## 🇺🇸 English Manual (English Instructions)

Welcome to the **Personal KM Web Boilerplate**. This template is a premium, client-side Personal Knowledge Management (Personal KM) dashboard powered by an interactive SVG Canvas relationship graph. It stores custom resources, categories, bookmarks, and files securely offline in the user's browser using `localStorage` and `IndexedDB`.

### 1. Running Locally
1. Open this directory in your terminal.
2. Install the lightweight development web server utility:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

### 2. Customizing Niche Data (Branding & Seeding)
To repurpose this template for another domain (e.g. coffee brewing, marketing, coding, fitness), you only need to edit files in the `data/` folder:

* **`data/config.json`**: Change branding details without touching the source code.
  * `siteTitle`: The title shown on the browser tab and page header.
  * `siteSubtitle`: Sub-header explanation text.
  * `logoName`: Text inside the logo badge (first 4 characters will display).
  * `rootNodeLabel`: Center node label on the graph (e.g. "My Wiki Center").
  * `ontologyContextUrl`: Base SEO namespace for the JSON-LD script metadata.

* **`data/categories.json`**: Define custom categories suited to your target domain:
  ```json
  [
    { "id": "general", "name": "General Principles" },
    { "id": "tools", "name": "Essential Software" }
  ]
  ```

* **`data/resources.json`**: Input initial seed resources that will be displayed to the client out-of-the-box.

---

### 3. Styling & Theming
Customize the fonts, background tones, and accent highlights by editing the CSS custom variables located at the top of [index.css](file:///Users/noppadolweerakitti/Library/Mobile%20Documents/com~apple~CloudDocs/2026/antigravity/woodworking%20kb/personal-km-template/index.css):
* `:root` contains variables for the default **Dark Theme**.
* `[data-theme="light"]` contains variables for the default **Light Theme**.
* `--bg-color` adjusts web canvas background.
* `--accent` sets the main brand color highlight (active buttons, interactive links, focused graph nodes).
* `--font-sans` changes typography fonts.

---

### 4. Backups & Database Management
Accessible via the **⚙️ Settings** button in the header:
* **Export Workspace**: Downloads all custom data (categories, collections, bookmarks, user-added resources) in a clean `.json` file.
* **Import Workspace**: Allows restoring/importing backup `.json` files via dragging and dropping them into the designated box.
* **Factory Reset**: Clears custom data and local IndexedDB files, reverting to the template's JSON defaults.

---

### 5. Deployment Guide
1. Push this folder to a new **GitHub Repository**.
2. Navigate to **Settings ▸ Pages** on GitHub.
3. Choose **Deploy from a branch** under **Source**, selecting your primary branch and directory `/`.
4. Click save, and your website will be live in less than 2 minutes!

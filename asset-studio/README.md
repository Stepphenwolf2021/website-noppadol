# Asset Studio

เว็บแอปเพิ่มข้อมูลสำหรับ My Assets Ontology ที่ `/asset-studio/` ใช้กับเว็บไซต์ Eleventy เดิมโดยไม่เพิ่ม runtime dependency

## ใช้งาน

1. เพิ่มรายการ: แยกชิ้นจริง รุ่นสินค้า ฉบับแผ่นเสียง กลุ่มฉบับ แทร็ก แบรนด์ บุคคล/องค์กร ส่วนประกอบ หรือบันทึกกิจกรรม
2. เลือก profile แล้วค้นคำศัพท์จาก CV/Thesaurus; หมวดนำทางใช้ Taxonomy เดิม ไม่สร้าง class ใหม่จากคำค้น
3. เพิ่มรายละเอียดที่ต้องใช้จาก Metadata Standard 96 ฟิลด์ ระบุ known/unknown/not_applicable พร้อมวิธีได้ข้อมูล ตัวเลขต้องมีหน่วย การอ้างอิงต้องเลือก entity ที่มีอยู่
4. อ่านระดับข้อมูลของฟิลด์ก่อนกรอก บันทึกต้นทางต้องอธิบายข้อมูลทั้งหมดในรายการนั้น แยกรายการรุ่น/ฉบับเมื่อข้อมูลไม่ได้เป็นของชิ้นจริง
5. ไอเดียต้องระบุ Mission ทรัพย์สินที่เกี่ยวข้อง เหตุผล ข้อจำกัด และบันทึกต้นทาง
6. สำรองเป็น JSON สำหรับกลับมาแก้ไข ส่งออก JSON-LD สำหรับ KG และตรวจ SHACL ก่อนนำไปใช้กับระบบอื่น

ทุกระเบียนเป็น owner/draft/unreviewed การบันทึกไม่ได้ยืนยันกรรมสิทธิ์ “source_supported” ของ describesAsset หมายถึงบันทึกผู้ใช้กล่าวถึงรายการนั้น ไม่ได้พิสูจน์ว่ารายละเอียดผู้ผลิตถูกต้อง ส่วน inspiresWork ใช้ creative_proposal และ context เท่านั้น

## การเก็บข้อมูล

- ใช้ localStorage (`noppadol.asset-studio.v1`) ใน origin/เบราว์เซอร์นี้ ไม่มี backend, บัญชีผู้ใช้, sync หรือการอัปโหลด inventory
- เว็บไซต์และไฟล์ข้อกำหนดเผยแพร่ได้ แต่ข้อมูลที่ผู้ใช้กรอกไม่ถูก commit หรือรวมใน public site graph
- สำรองข้อมูลก่อนล้าง browser storage ย้ายเครื่อง หรือเปลี่ยน origin; ปุ่มนำเข้าแทนที่ข้อมูลหลังตรวจทั้งไฟล์และยืนยัน ไม่ merge เงียบ ๆ
- บันทึกเมื่อกด Save เท่านั้น ปิดฟอร์มหรือ reload ก่อน Save จะไม่เก็บสิ่งที่พิมพ์
- สถานะ owner ใน RDF ไม่ใช่การเข้ารหัสหรือระบบสิทธิ์ ข้อมูลอ่านได้โดยผู้ใช้เครื่องและสคริปต์บน origin เดียวกัน
- รองรับไฟล์นำเข้าสูงสุด 8 MB และ 2,000 records+ideas; browser quota อาจน้อยกว่านั้น แอปแจ้งเมื่อบันทึกไม่ได้ และไม่รายงานว่าสำเร็จ
- JSON-LD เป็น **snapshot ปัจจุบัน** ใช้แทนที่ named graph ของชุดข้อมูลนี้ ไม่ append รวมทุก export โดยไม่มีนโยบาย revision; แอปยังไม่เก็บประวัติทุกการแก้ไข

## Ontology Pipeline baseline

`standards/` เก็บชุดที่ออกแบบไว้: CV 1.1.1, Metadata 1.3.0, Taxonomy 1.0.0, Thesaurus 1.0.0, Assets Ontology/Bridge 1.0.0 และ Core snapshots

- `model.js`: validation ของแบบกรอก/ไฟล์สำรอง และ JSON-LD exporter
- `app.js`: UI, persistence, graph overview, restore/export
- `standards/shapes.ttl`, `standards/core-shapes.ttl`: SHACL ที่ใช้ตรวจจริงในขั้นทดสอบ/นำเข้า
- กราฟฝังข้อความต้นทางแบบ UTF-8 data URI พร้อม SHA-256 และ TextLocator (offset เป็น Unicode code point, paragraph 0 = snapshot ทั้งข้อความ)
- ไม่มีการ fetch URL ต้นทาง ไม่มี analytics และไม่มี external script/font/CDN
- ไม่ map namespace ของ Core ไปเป็น schema.org/std ของเว็บไซต์เดิมโดยเดา ความสัมพันธ์กับ public content graph ต้องมี reviewed mapping ก่อน

ฟอร์มตรวจ required fields, คำศัพท์, units presence, IDs/references, observation status, provenance และระดับ entity ของความสัมพันธ์ แต่ไม่ได้รัน SHACL engine ในเบราว์เซอร์ และยังไม่ตรวจ appliesTo/หน่วย/ช่วงค่าราย field ทุกชนิด ข้อมูล JSON ซ้อนยังเก็บเป็นข้อความ ไม่แตกเป็นโหนดรายเครดิตอัตโนมัติ

การเสนอแรงบันดาลใจยังเป็นการกรอกโดยผู้ใช้ ไม่ใช่ AI recommendation engine; กองทุน/crypto และเผยแพร่ public/member อยู่นอก pilot นี้

## พัฒนาและทดสอบ

ใช้ Node.js 20 ขึ้นไปเหมือน GitHub Actions ของเว็บไซต์:

```sh
npm ci
npm run test:assets
npm run build
npm start
```

เปิด `http://localhost:8080/asset-studio/` หรือใช้ static HTTP server กับ repository; ไม่เปิดผ่าน file:// เพราะ module/fetch ต้องใช้ HTTP

ตรวจ export ด้วยข้อกำหนดเดิม:

```sh
python -m pip install -r asset-studio/standards/requirements.txt
python tools/check-asset-graph.py path/to/noppadol-assets-graph.jsonld
```

Node tests สร้าง JSON-LD สมมติในโฟลเดอร์ temp ของระบบ (`noppadol-asset-tests` หรือกำหนด ASSET_TEST_OUTPUT) เพื่อให้ตรวจต่อด้วย SHACL ได้

Build ใช้ passthrough ของ Eleventy; หลัง merge เข้า main workflow เดิมจึง deploy ไป `/asset-studio/` ไม่มีการ deploy จาก feature branch

ทดสอบ UI เพิ่มเติม (ต้องมี Playwright และ Chromium ในสภาพแวดล้อมทดสอบ): รัน static server ที่พอร์ต 8765 แล้วรัน `node tools/tests/asset-studio.browser.cjs` กำหนด `PLAYWRIGHT_MODULE`, `CHROME_PATH`, `ASSET_BASE_URL` ได้ตามเครื่อง ผลทดสอบ/ภาพหน้าจออยู่ใน temp เท่านั้น

เส้นทาง dependencies ในไฟล์ JSON อ้างถึงชุดต้นทางใน workspace เดิม โดยตัด absolute path ของเครื่องออกก่อนเผยแพร่ ค่า hash ใช้ระบุ baseline ต้นทาง ไม่ใช่การอ้างว่าไฟล์ dependency ทุกไฟล์อยู่ใน repository นี้

## แอปเฉพาะประเภท

| แอป | URL | งานหลัก |
|---|---|---|
| Woodworking Workshop | `/asset-studio/woodworking/` | กบ สิ่ว เลื่อย หินลับคม ใบตัด และบันทึกการใช้/ดูแล |
| Record Room | `/asset-studio/records/` | แผ่นที่ถือครอง ฉบับเผยแพร่ กลุ่มฉบับ แทร็ก และบันทึกการฟัง |
| Camera Cabinet | `/asset-studio/photography/` | กล้อง เลนส์ อุปกรณ์เสริม รุ่น และบันทึกการถ่ายภาพ/ดูแล |

แต่ละแอปมีธีม หน้าทะเบียน ตัวเลือกชนิดรายการ และปุ่มเปิดแบบกรอกเฉพาะงาน การเลือกแบบกรอกเตรียมฟิลด์สถานะ unknown เท่านั้น ไม่สร้างสเปกหรือค่าที่ไม่มีหลักฐานให้เอง เลื่อย หินลับคม และอุปกรณ์เสริมยังใช้ common fields จนกว่าจะขยาย Metadata Standard

ใช้คลังข้อมูลและ Ontology ร่วมกัน ไม่ทำสำเนารายการหนึ่งไปหลายฐาน แอปบันทึก `domain` เป็น metadata สำหรับ navigation ของแบบกรอก ไม่ประกาศว่าเป็น ontology class ใหม่ รายการรุ่น/แบรนด์ร่วมกันเลือกอ้างอิงข้ามแอปได้ ไอเดียเชื่อมข้ามแอปได้ และกราฟแต่ละแอปแสดงบริบทของรายการที่เชื่อมโดยตรงด้วย

ข้อมูลเดิมยังอ่านได้: hand_plane/chisel แสดงในงานไม้, record_disc ในแผ่นเสียง, camera ในกล้อง; รายการ generic/component ที่ยังไม่ชัดเจนคงอยู่ในคลังกลาง เปิดแก้ไขแล้วเลือก “จัดเก็บในแอป” เพื่อจัดหมวดได้โดยไม่เปลี่ยน ID

การสำรอง นำเข้า และส่งออก KG เป็น **ทั้งคลังทุกแอป** โดยระบุบนปุ่มและข้อความยืนยัน เพื่อรักษาการอ้างอิงข้ามแอป การเปิดหลายแท็บตรวจการเปลี่ยนข้อมูลจากอีกแท็บและป้องกันการเขียนทับฟอร์มเก่า ข้อความที่ยังไม่บันทึกจะคงในฟอร์มให้คัดลอกก่อนเปิดใหม่

`domains.js` เป็น configuration ร่วม; `tools/build-asset-apps.mjs` สร้างหน้า entry ของแต่ละแอปจาก shell เดียวทุกครั้งที่ build/start ไม่ทำสำเนา logic หรือ ontology ข้ามแอป

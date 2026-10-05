# คลังภาพจาก Lightroom → noppadol.online

สถานะ 28 กันยายน 2026: สร้างบน Eleventy ใน repository `Stepphenwolf2021/website-noppadol` มี Gallery, ตัวนำเข้า JPEG/metadata, หน้าทดลองในเครื่อง, การเตรียมภาพเพื่อเผยแพร่ และ JSON-LD เชื่อมบทความกับภาพ ไม่มี Lightroom plug-in หรือการอัปโหลดตรงจากปุ่ม Publish ไป GitHub ในรุ่นนี้

## วิธีใช้สำหรับเจ้าของ

1. แต่งภาพใน Lightroom Classic ตามปกติ ใส่ **Title, Caption, Creator, Copyright และ Keywords** ให้กับภาพ วันที่จะใช้ค่าที่มีในไฟล์ ไม่เดาจากชื่อไฟล์
2. ใช้ **Library → Publish Services → Hard Drive** ตั้งโฟลเดอร์ส่งออกสำหรับเว็บไซต์ เมื่อแก้ภาพ Lightroom จะแสดงภาพที่ต้อง Publish ใหม่ รองรับ Export JPEG ปกติด้วย
3. แนะนำ JPEG, sRGB, ด้านยาว 2400 px, quality 85–90, ไม่ขยายภาพเล็ก เลือกส่งออก metadata ที่มีชื่อ/คำบรรยาย/คำค้น ไม่เลือก Copyright Only ปิดข้อมูลสถานที่และบุคคลหากไม่ต้องการเก็บในไฟล์ส่งออก
4. เก็บชื่อไฟล์และชื่อชุดภาพเดิมทุกครั้ง ใช้ชื่อไม่ซ้ำกันสำหรับภาพคนละภาพหรือ virtual copy อย่าเปลี่ยนเลขลำดับตามจำนวนที่เลือก เพราะชื่อไฟล์ในชุดเป็นตัวระบุภาพของรุ่นนี้
5. ให้ตัวนำเข้าอ่านโฟลเดอร์นั้น ตรวจภาพและ metadata ในหน้าทดลอง แล้วเตรียมภาพรุ่นที่ตรวจแล้วส่งเข้า repository เว็บจะสร้าง Gallery และ graph พร้อมกันตอน deploy

**Web Module ในภาพหน้าจอ:** รองรับไฟล์ที่ Export มาแล้ว โดยตัวนำเข้าจะเลือกเฉพาะ `content/images/large` ไม่เอา thumbnail มานับเป็นภาพซ้ำ แต่ Web Module ส่งออกเว็บ HTML ทั้งชุดและอาจลดขนาด/metadata จึงเหมาะกับการนำของเดิมมาทดลอง ส่วนงานต่อเนื่องแนะนำ Hard Drive Publish

เอกสาร Adobe: [Web export/FTP](https://helpx.adobe.com/in/lightroom-classic/help/preview-export-upload-web-photo.html), [Hard Drive Publish](https://helpx.adobe.com/lightroom-classic/desktop/export-photos/export-hard-drive-using-publish.html)

## ภาพชุดแรกที่ตรวจจริง

นำเข้า My Assets 9 ภาพจาก Lightroom Web export ที่เจ้าของระบุ เฉพาะภาพใหญ่ ไม่แก้ต้นฉบับ พบด้านยาวประมาณ 450 px และมี Copyright แต่ Title/Caption/Creator/Keywords/วันที่ถ่ายไม่มีใน JPEG; HTML หน้ารายละเอียดที่ตรวจมีชื่อ/คำบรรยายว่างด้วย ภาพทั้งหมดอยู่ใน draft local preview ยังไม่ใส่ใน public catalog ไม่เดาความสัมพันธ์กับเครื่องมืองานไม้จากหน้าตาหรือชื่อไฟล์

ทั้งเครื่องมืองานไม้และแผ่นเสียงใช้คลังนี้ได้ รวมถึงภาพเรื่องอื่น ๆ; ชุดภาพไม่เท่ากับ record ของทรัพย์สิน การผูกภาพกับ source UUID/AssetItem ต้องมีหลักฐานและตรวจแยก

## คำสั่งสำหรับผู้ดูแล

ต้องมี Node.js 20.9+ และ ExifTool (`exiftool` บน PATH); `npm ci` ติดตั้ง Eleventy/Sharp ตาม lockfile ส่วน build บน GitHub ไม่ต้องอ่านต้นฉบับและไม่ต้องใช้ ExifTool เว้นแต่รัน tests

```sh
npm ci
npm run gallery:import -- --source "/path/to/Lightroom exports" --collection my-assets --title "สิ่งของและเรื่องราว"
npm run gallery:preview
python3 -m http.server 3011 --bind 127.0.0.1 --directory .gallery/preview-site
```

เปิด `http://127.0.0.1:3011/gallery/` เพื่อดูเว็บตัวอย่าง หรือเปิด `.gallery/review.html` เพื่อดูฟิลด์ต้นทางและ revision ทั้งสองแบบอยู่ในเครื่อง ภาพ draft ไม่เข้า `_site` ของ build ปกติ

หลังตรวจภาพ ชื่อ ผู้สร้าง ลิขสิทธิ์ และข้อความ alt แล้ว:

```sh
npm run gallery:approve -- --id "photo-ID" --revision "FULL-SHA256" --reviewer "ชื่อผู้ตรวจจริง" --alt "คำอธิบายสิ่งที่เห็นในภาพ"
npm run test:gallery
npm run build
```

คำสั่ง approve เพียงเตรียมไฟล์สำหรับเผยแพร่ **ยังไม่ push/deploy** ไม่ใช้ชื่อเจ้าของเป็น reviewer แทนโดยที่เจ้าของไม่ได้ตรวจ เลือก commit เฉพาะโค้ด, `src/_data/galleryCatalog.json` และภาพที่เตรียมเผยแพร่ใน `src/assets/gallery/`; ไม่ commit `.gallery/` จากนั้นใช้ PR/ขั้นเผยแพร่ของ repository ตามคำขอเจ้าของ workflow เดิม deploy เมื่อ push เข้า `main`

## ใช้ภาพในบทความ

ในเนื้อหา Markdown/Nunjucks ใส่ shortcode โดยใช้ ID จากหน้ารายละเอียดภาพ:

```njk
{% galleryImage "photo-ID" %}
{% galleryImage "photo-ID", "คำอธิบายภาพ", "คำบรรยายเฉพาะบทความ" %}
```

สำหรับภาพนำบทความ ตั้ง `gallery_image: photo-ID` ใน front matter และใช้ `hero_alt`/`hero_caption` เพื่อกำหนดข้อความเฉพาะเรื่อง ภาพจะลิงก์กลับหน้ารายละเอียด และ graph ของบทความมี `image` อ้างถึง ImageObject เดียวกัน

- หน้าภาพ: `/gallery/photo-ID/` เป็นลิงก์ถาวร
- ไฟล์ภาพล่าสุด: `/assets/gallery/photo-ID/current.jpg` เปลี่ยนเมื่อเตรียมรุ่นใหม่และ deploy; cache ของ browser/CDN อาจทำให้เห็นรุ่นเก่าชั่วคราว
- Shortcode ใช้ไฟล์ที่มี revision ใน URL จึงเปลี่ยน URL เมื่อ build ด้วยภาพรุ่นใหม่ เก็บไฟล์รุ่นเก่าไว้ให้ลิงก์เดิมยังใช้ได้
- การลบภาพจากโฟลเดอร์ Lightroom ไม่ลบ Gallery โดยอัตโนมัติ เพื่อป้องกันบทความที่อ้างอิงภาพเสีย ไม่มีคำสั่งถอนภาพสาธารณะในรุ่นนี้ ต้องตรวจ usages และจัดการเป็นงานแยก

## Metadata และ Knowledge Graph

| หลักฐานจาก JPEG | ฟิลด์ที่เก็บ/ใช้ | ข้อจำกัด |
|---|---|---|
| XMP Title / IPTC ObjectName | title → schema:name | คงภาษาต้นทาง |
| XMP Description / IPTC Caption | caption → schema:caption | ไม่แต่งคำบรรยายจากภาพเอง |
| XMP Creator / IPTC By-line | creator → dct:creator | เก็บชื่อเป็น literal ไม่จับคู่บุคคลด้วยชื่ออย่างเดียว |
| XMP Rights / IPTC CopyrightNotice | copyright → schema:copyrightNotice | ไม่อนุมานสิทธิ์จากตัวรูป |
| XMP Subject / IPTC Keywords | keywords → schema:keywords | คำค้นดิบ ไม่แปลงเป็น approved SKOS concepts หรือ hierarchy อัตโนมัติ |
| DateTimeOriginal / DateCreated | capturedAt → kg:sourceDateText | เก็บข้อความเดิม ไม่เพิ่ม timezone หรือแก้ปีเอง |
| bytes ของ export | sourceHash / revision / dimensions | provenance ของ export ที่รับ ไม่ใช่การยืนยัน Lightroom catalog UUID หรือ RAW ต้นฉบับ |

XMP มีลำดับความสำคัญก่อน IPTC; raw metadata ทั้งชุดเก็บใน snapshot ส่วนตัวเพื่อย้อนตรวจ GPS, serial number, face regions, local path และข้อมูลอื่นที่ไม่ได้อยู่ในตารางไม่ส่งเข้า public catalog สำเนาภาพเว็บถูก rotate ตาม orientation, ย่อและสร้างใหม่โดยไม่เก็บ EXIF/IPTC เดิม ต้นฉบับและลิขสิทธิ์ที่อ่านได้ยังอยู่ในหลักฐานและ catalog

`/gallery/metadata.jsonld` ส่งออก collection และ ImageObject; `/knowledge-graph.jsonld` รวมกับกราฟบทความเดิม จุดนี้เป็น graph data ที่สร้างจริง ไม่ได้เปลี่ยนแผนที่ความสนใจบนหน้าแรกให้เป็นกราฟภาพ interactive และยังไม่ได้ migrate เข้ากราฟทดลอง Knowledge Garden

คำศัพท์ชนิดและ predicates เป็นอังกฤษ; label เชิงโครงสร้างเป็นอังกฤษ ข้อความ metadata เป็นหลักฐานภาษาเดิม ทุกภาพยัง `semanticReviewStatus: unreviewed` แม้ผ่านการตรวจเพื่อเผยแพร่ภาพแล้ว การเชื่อม `depicts` ไปเครื่องมือหรือรุ่นแผ่นเสียงยังต้องข้อเสนอและหลักฐานแยก

## สถานะตาม Ontology Pipeline

งานนี้ใช้ขั้น 2 (metadata profile/crosswalk) และขั้น 5–6 (ImageObject, provenance, graph/query fixtures) อาศัย Core/Assets เป็นบริบท โดยไม่เปลี่ยน CV v1.2.0 หรืออ้างว่าได้รับอนุมัติแล้ว

- CQ-P01: ภาพนี้มาจาก export รุ่นใด? → ID, sourceHash, revision
- CQ-P02: บทความอ้างภาพใด? → article image IRI ตรงกับ ImageObject
- CQ-P03: การแก้ภาพเปลี่ยน identity หรือไม่? → ID เดิม revision ใหม่; approval รุ่นเก่าใช้กับ draft ใหม่ไม่ได้
- CQ-P04: ข้อมูลที่ไม่เผยแพร่หลุดเข้า build หรือไม่? → public build ไม่ใช้ registry/draft; ตัวภาพไม่มี GPS/serial; catalog มีเฉพาะฟิลด์ที่เลือก

Dependency ภาพตรึง Sharp 0.35.5; การเปลี่ยน renderer ต้องเปลี่ยน pipelineVersion เพื่อให้ revision สะท้อนสำเนาภาพใหม่

Tests ใช้ภาพ fixture สร้างเอง ตรวจความคงที่ของ ID, ไม่รวมภาพต่าง record แม้ bytes เหมือนกัน, Unicode, stale revision, stripping, tampering และลิงก์ภาพที่ไม่พบ ไม่ถือเป็นการทดสอบ Lightroom plug-in หรือการ publish จากแอปจริง

## ข้อจำกัดของรุ่นนี้

- เป็น workflow **Publish to Hard Drive → import/review → GitHub deployment** ไม่ใช่ปุ่ม Publish ตรงเข้าเว็บ และไม่ตั้งค่า Lightroom แทนเจ้าของ
- Identity อาศัย collection + relative export filename; ต้องใช้ชื่อถาวร ห้ามนำชื่อเดิมไปใช้กับภาพคนละภาพ การเปลี่ยนชื่อจะสร้าง record ใหม่ ไม่มีการ merge อัตโนมัติ
- Public repository เปิดเผยทุกไฟล์ที่ commit; `.gallery` เป็น private local workspace ไม่ใช่ backup ต้องสำรองให้เหมาะสม และห้ามเปิด HTTP server ที่ root repository ให้เครือข่ายภายนอก
- ห้ามนำ `.gallery/preview-site` ไป deploy เพราะมี drafts; workflow GitHub ใช้ `npm run build` และ `_site` ปกติเท่านั้น
- ภาพเพิ่มเรื่อย ๆ จะทำให้ Git repository ใหญ่ขึ้น รุ่นเริ่มต้นใช้ GitHub Pages เดิม; หากภาพจำนวนมากจึงค่อยเปลี่ยนที่เก็บไฟล์โดยรักษา IDs

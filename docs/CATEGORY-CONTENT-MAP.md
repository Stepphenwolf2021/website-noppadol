# ชื่อตำแหน่งข้อความในหน้าหมวด

ใช้ชื่อไทยต่อไปนี้สั่งแก้ข้อความ โดยระบุหมวดและชื่อบทความเมื่อมีหลายรายการ เช่น “หมวด AI เปลี่ยนคำอธิบายหมวดเป็น …” หรือ “หมวด AI บทความเลิกเรียนรู้ตลอดชีวิต แก้คำโปรยบทความเป็น …”. รหัสอังกฤษเป็นจุดอ้างอิงใน HTML (`data-content-key`) ไม่แสดงต่อผู้อ่าน ไม่ใช่ชื่อประเภทหรือpredicateในontology.

| ชื่อสำหรับสั่งแก้ | รหัสตำแหน่ง | ตำแหน่ง / ตัวอย่าง | แหล่งข้อความ |
|---|---|---|---|
| ชื่อเว็บไซต์ | site.brand | noppadol.online ด้านบนซ้าย | src/_includes/layouts/atlas.njk |
| ลิงก์กลับหน้าแรก | site.back | ← กลับสู่แผนที่ | layout เดียวกัน |
| คติประจำเว็บ | site.motto | dubito ergo non solus | layout เดียวกัน |
| ชื่อหมวดอังกฤษ | category.title.en | ai | src/_data/atlas.js: definitions → label |
| ชื่อหมวดไทย | category.title.th | ปัญญาประดิษฐ์ | atlas.js: definitions → th |
| คำอธิบายหมวด | category.description | ai เก่งขึ้นทุกวัน เราต้องลึกซึ้งขึ้นทุกเวลา | atlas.js: definitions → description |
| ภาพสัญลักษณ์หมวด / คำบรรยายภาพสำหรับการเข้าถึง | category.visual | ภาพเล็กข้างชื่อหมวด / alt | src/_data/topicArtwork.json |
| หัวข้อรายการเนื้อหา | content.heading | บันทึกในหมวดนี้ | src/topics.njk |
| จำนวนเรื่อง | content.count | 1 เรื่อง | คำนวณจากบทความจริงใน template ห้ามแก้เลขด้วยมือ |
| ประเภทเนื้อหา | article.type | บทความ / บันทึก | src/topics.njk |
| ชื่อบทความ | article.title | เลิก “เรียนรู้ตลอดชีวิต”… | editorial.json: title หรือ front matter ของ src/content/ |
| คำโปรยบทความ | article.summary | ข้อความสรุปใต้ชื่อบทความ | editorial.json: subtitle หรือ front matter ของ src/content/ |
| ลิงก์อ่านบทความ | article.read | อ่านเรื่องนี้ต่อ | src/topics.njk |
| หัวข้อคำที่เกี่ยวข้อง | concept.heading | คำที่ชวนให้ค้นต่อ | src/topics.njk |
| คำที่เกี่ยวข้อง | concept.links | ลิงก์แนวคิดใต้บทความ/ท้ายรายการ | semantic.json: labels/URLs; เกี่ยวกับข้อมูลsemantic ต้องตรวจผลกระทบก่อนแก้ |
| หัวข้อเมื่อหมวดยังว่าง | empty.title | เรื่องราวจะค่อย ๆ เพิ่มขึ้นที่นี่ | src/topics.njk |
| คำอธิบายเมื่อหมวดยังว่าง | empty.description | หมวดนี้ยังไม่มีบทความที่เผยแพร่… | src/topics.njk |
| หัวข้อแผนที่ด้านข้าง | sidebar.heading | my place in the universe | src/topics.njk |
| ชื่อศูนย์กลางแผนที่ | map.root | seize the day universe | src/topics.njk |
| หมวดปัจจุบันบนแผนที่ | map.current | ai / ปัญญาประดิษฐ์ | ชื่อหมวดจาก atlas.js ใช้ร่วมกับหัวหน้า |
| ลิงก์โครงสร้างความรู้ | map.foundation | mission-driven ontology | src/topics.njk |
| หัวข้อหมวดอื่น | related.heading | สำรวจเรื่องอื่นๆ | src/topics.njk |
| ชื่อหมวดอื่น | related.topic | coffee / กาแฟ ฯลฯ | atlas.js ใช้ชื่อหมวดเดียวกับหน้าปลายทาง |
| หมายเหตุแผนที่ | sidebar.note | เส้นในแผนที่แสดงการอยู่ในหมวดเดียวกัน… | src/topics.njk |

## กติกาอ้างอิง

- ชื่อหมวด/คำอธิบายหมวดเปลี่ยนที่ข้อมูลกลางเพื่อให้หน้าแรก หน้าหมวด และแผนที่ตรงกัน รหัสหมวด/URI/URL เป็นidentity แยกจากข้อความ ไม่เปลี่ยนตามชื่อโดยอัตโนมัติ.
- ตำแหน่ง article.* และ related.topic มีได้หลายรายการ ให้ระบุชื่อเรื่องหรือหมวดร่วมด้วย รหัสเป็นชื่อช่อง ไม่ใช่unique IDของบทความ.
- ข้อความประจำหน้าทั้งแปดหมวดใช้แม่แบบเดียวกัน ถ้าขอเปลี่ยนเฉพาะหมวดต้องเพิ่มoverrideที่ข้อมูลหมวด ไม่แก้ข้อความกลางให้กระทบทุกหน้าโดยไม่ตั้งใจ.
- เนื้อหาในตัวบทความแก้จากต้นฉบับของเรื่องนั้น คำโปรยบนหน้ารวมเป็นอีกช่องหนึ่ง ไม่แก้แทนกัน.

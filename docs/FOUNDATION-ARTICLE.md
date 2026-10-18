# The foundation ตอนที่ 1

ฉบับบรรณาธิการ0.4 รับข้อแก้A01–A03และคำแก้ล่าสุดของเจ้าของแล้ว เตรียมในเครื่อง ยังไม่deploy

- `/notes/the-foundation-01/` ใช้presentationfoundationในeditorial.jsonและ`_includes/foundation-article.njk`;ตัวบทcanonicalสำหรับpublicprojectionอยู่editorial.json เปลี่ยนตัวบทต้องปรับpartialคู่กันและตรวจparagraphfidelity ไม่ใช่automaticScrivenersync
- หมวดหลักknowledge-management/รองai ใช้`tools/topic-membership.mjs`ร่วมกับtopiclist/atlasgraph ข้อมูลArticleJSONLDและsitegraphใช้membershipเดียวกัน;ไม่เดาdatePublishedหรือconceptIDs
- `assets/css/article.css`scopedfoundation-story;ภาพMemexและplatformv6ที่`assets/articles/foundation/` พร้อมWebP/PNGขยาย ใช้ลิงก์ขยายแทนย่อข้อความภาพให้อ่านบนมือถือ
- Memex:AlfredCrimi,LIFE10Sep1945 เครดิต/แหล่งอยู่caption สิทธิ์ยังไม่independentlyverified ภาพplatformเป็นconceptualillustrationที่AIสร้างไม่ใช่proofdeployment
- buildและ13atlas/domain/foundationchecksผ่าน ตรวจbrowser1000/390/ลิงก์ภาพขยาย/หน้าหมวดKMแล้ว ผลละเอียดอยู่output/foundation-v04-integration-2026-10-19ในworkspaceหลัก
- preview3032เสิร์ฟwebsite/_site;previewproof3034เดิมredirectไปบทความใหม่โดยเก็บindexเดิมก่อนintegration ไม่มีpush/PR/deployในรอบนี้

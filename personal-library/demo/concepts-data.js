/* Concept scheme (SKOS-style) — curated static demo of blueprint layer L1.
   ในระบบจริง ชั้นนี้สร้างได้กึ่งอัตโนมัติ (BROADER จาก DDC/LCSH, RELATED_TO จาก LLM + ผู้ใช้ยืนยัน)
   ที่นี่เป็นข้อมูล curated เพื่อสาธิต "การเชื่อมความรู้ข้ามหมวด" ที่หัวเรื่องตรงกันเป๊ะทำไม่ได้.
   hubs = แนวคิดข้ามหมวดที่เพิ่มเข้ามาเป็นจุดเชื่อม (ไม่มีหนังสือตรง แต่โยงแนวคิดอื่น)
   edges = [from, to, rel]  rel: 'BROADER' (child→parent) | 'RELATED_TO' (associative) */
const CONCEPT_SCHEME = {
  hubs: ['Beverages', 'Psychology & Mind', 'Society & Culture', 'Food & Fermentation'],
  edges: [
    // --- BROADER: หัวเรื่องย่อย → แนวคิดกว้าง ---
    ['Coffee brewing', 'Coffee', 'BROADER'],
    ['Coffee', 'Beverages', 'BROADER'],
    ['Tea', 'Beverages', 'BROADER'],
    ['Fermented foods', 'Food & Fermentation', 'BROADER'],
    ['Fermentation', 'Food & Fermentation', 'BROADER'],
    ['Artificial intelligence', 'Technology', 'BROADER'],
    ['Biotechnology', 'Technology', 'BROADER'],
    ['Psychological aspects', 'Psychology & Mind', 'BROADER'],
    ['Social aspects', 'Society & Culture', 'BROADER'],
    ['History', 'Society & Culture', 'BROADER'],
    // --- RELATED_TO: สะพานเชิงแนวคิดข้ามหมวด ---
    ['Coffee', 'Food & Fermentation', 'RELATED_TO'],   // การโพรเซสกาแฟ = การหมัก (เชื่อม Hoffmann → fermentation)
    ['Coffee', 'Tea', 'RELATED_TO'],
    ['Food & Fermentation', 'Agriculture', 'RELATED_TO'],
    ['Food & Fermentation', 'Biotechnology', 'RELATED_TO'],
    ['Beverages', 'Agriculture', 'RELATED_TO'],
    ['Psychology & Mind', 'Health', 'RELATED_TO'],
    ['Psychology & Mind', 'Business', 'RELATED_TO'],
    ['Artificial intelligence', 'Society & Culture', 'RELATED_TO'],
  ],
};

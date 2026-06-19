#!/usr/bin/env python3
# ข้อ 1: รับ "ชื่อ" → ค้น Wikidata → โชว์ผู้สมัครพร้อมคำอธิบาย ให้เลือก Q-id ที่ตรง
# วิธีรัน:  python3 reconcile.py "Hermann Hesse"
import sys, json, urllib.parse, urllib.request, urllib.error

UA  = {"User-Agent": "SeizeTheDay/1.0 (noppadol@neogens.co)"}
API = "https://www.wikidata.org/w/api.php"

def search(name, lang="en", limit=7):
    url = API + "?" + urllib.parse.urlencode({
        "action":"wbsearchentities","search":name,"language":lang,
        "uselang":lang,"type":"item","limit":limit,"format":"json"})
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r).get("search", [])

if len(sys.argv) < 2:
    print('ใช้:  python3 reconcile.py "ชื่อ entity"'); sys.exit()

name = sys.argv[1]
hits = search(name)
if not hits:
    print(f"ไม่พบผู้สมัครสำหรับ: {name}"); sys.exit()

print(f"ผู้สมัครสำหรับ \"{name}\" (เลือกตัวที่คำอธิบายตรง):\n")
for h in hits:
    print(f"  {h['id']:<10} {h.get('label','')}")
    print(f"             {h.get('description','(ไม่มีคำอธิบาย)')}\n")
print("→ คัดลอก Q-id ที่ตรงไปใช้กับ enrich-wikidata.py หรือใส่ใน sameas-review.json")

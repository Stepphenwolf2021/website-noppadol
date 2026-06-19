#!/usr/bin/env python3
# ลงทะเบียน entity ใหม่ครั้งเดียว → ใช้ได้ทุกบทความ (เขียนลง src/_data/entities.json)
# ดูผู้สมัคร:   python3 register.py person/john-searle "John Searle"
# บันทึก:       python3 register.py person/john-searle "John Searle" Q317384 [Person]
import sys, os, json, urllib.parse, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
REG  = os.path.normpath(os.path.join(HERE, "..", "src", "_data", "entities.json"))
UA   = {"User-Agent": "SeizeTheDay/1.0 (noppadol@neogens.co)"}
API  = "https://www.wikidata.org/w/api.php"

def search(name):
    url = API + "?" + urllib.parse.urlencode({"action":"wbsearchentities","search":name,
        "language":"en","uselang":"en","type":"item","limit":7,"format":"json"})
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30)).get("search", [])

if len(sys.argv) < 3:
    print('ใช้: python3 register.py <id> "<ชื่อ>" [Qxxxx] [Type]'); sys.exit()
eid, name = sys.argv[1], sys.argv[2]
qid  = sys.argv[3] if len(sys.argv) > 3 else None
etyp = sys.argv[4] if len(sys.argv) > 4 else "Person"

if not qid:
    print(f'ผู้สมัครสำหรับ "{name}" (เลือกตัวที่คำอธิบายตรง):')
    for h in search(name):
        print(f"  {h['id']:<10} {h.get('label','')} — {h.get('description','(ไม่มีคำอธิบาย)')}")
    print(f'\nรันซ้ำพร้อม Q-id ที่เลือก เช่น:  python3 register.py {eid} "{name}" Qxxxx'); sys.exit()

reg = json.load(open(REG, encoding="utf-8")) if os.path.exists(REG) else {}
reg[eid] = {"name": name, "type": etyp, "sameAs": f"https://www.wikidata.org/wiki/{qid}"}
json.dump(reg, open(REG, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"✓ บันทึก {eid} → {qid} ({etyp}) ลงทะเบียนแล้ว")

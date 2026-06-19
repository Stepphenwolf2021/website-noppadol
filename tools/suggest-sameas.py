#!/usr/bin/env python3
# ข้อ 2: ไล่ mentions จากโพสต์ทั้งคลัง → เสนอ Q-id (ให้รีวิว) → เขียน same_as กลับ front matter
#
# โหมด:
#   python3 suggest-sameas.py list      # (ไม่ใช้เน็ต) แสดง mentions ไม่ซ้ำที่เจอ — ใช้ตรวจก่อน
#   python3 suggest-sameas.py suggest   # (ใช้เน็ต) ค้น Wikidata เขียน sameas-review.json ให้รีวิว
#   python3 suggest-sameas.py apply     # (ไม่ใช้เน็ต) อ่าน review ที่เติม chosen แล้ว เขียน same_as กลับไฟล์
import sys, os, re, json, glob, time, urllib.parse, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
# โฟลเดอร์โพสต์ (มี front matter เต็มพร้อม mentions)
POSTS = os.path.normpath(os.path.join(HERE, "..", "..", "fb-organized", "by-department"))
REVIEW = os.path.join(HERE, "sameas-review.json")
UA  = {"User-Agent": "SeizeTheDay/1.0 (noppadol@neogens.co)"}
API = "https://www.wikidata.org/w/api.php"

def files():
    return sorted(glob.glob(os.path.join(POSTS, "*", "*.md")))

def mentions_in(path):
    out, inblk = [], False
    for line in open(path, encoding="utf-8"):
        if re.match(r"^mentions:\s*$", line): inblk = True; continue
        if inblk:
            if line.strip() == "---" or re.match(r"^[^\s#-]", line): break
            m = re.match(r'\s*-\s*name:\s*"?(.+?)"?\s*$', line)
            if m: out.append(m.group(1).strip())
    return out

def all_mentions():
    from collections import Counter
    c = Counter()
    for f in files():
        for n in mentions_in(f): c[n] += 1
    return c

def search(name, limit=3):
    url = API + "?" + urllib.parse.urlencode({
        "action":"wbsearchentities","search":name,"language":"en",
        "uselang":"en","type":"item","limit":limit,"format":"json"})
    req = urllib.request.Request(url, headers=UA)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r).get("search", [])
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3: time.sleep(5); continue
            raise

def cmd_list():
    c = all_mentions()
    print(f"พบ mentions ไม่ซ้ำ {len(c)} รายการ (จาก {len(files())} ไฟล์):\n")
    for name, n in c.most_common():
        print(f"  {n:>2}x  {name}")

def cmd_suggest():
    c = all_mentions()
    rows = []
    for i, (name, n) in enumerate(c.most_common(), 1):
        cands = [{"qid":h["id"], "label":h.get("label",""),
                  "desc":h.get("description","")} for h in search(name)]
        rows.append({"name":name, "count":n, "chosen":"", "candidates":cands})
        print(f"[{i}/{len(c)}] {name} → " +
              (", ".join(f"{x['qid']}({x['desc'][:30]})" for x in cands) or "ไม่พบ"))
        time.sleep(0.3)  # สุภาพกับ Wikidata
    json.dump(rows, open(REVIEW,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"\nเขียน {REVIEW}\nเปิดไฟล์นี้ เติม \"chosen\":\"Qxxxx\" เฉพาะอันที่ยืนยัน (เว้นว่าง=ข้าม) แล้วรัน apply")

def cmd_apply():
    rows = json.load(open(REVIEW, encoding="utf-8"))
    chosen = {r["name"]: r["chosen"].strip() for r in rows if r.get("chosen","").strip()}
    if not chosen:
        print("ยังไม่มี chosen ที่เติมไว้ใน sameas-review.json"); return
    changed = 0
    for path in files():
        lines = open(path, encoding="utf-8").read().split("\n")
        out, inblk, touched = [], False, False
        i = 0
        while i < len(lines):
            line = lines[i]; out.append(line)
            if re.match(r"^mentions:\s*$", line): inblk = True; i += 1; continue
            if inblk:
                if line.strip() == "---" or re.match(r"^[^\s#-]", line): inblk = False
                else:
                    m = re.match(r'(\s*)-\s*name:\s*"?(.+?)"?\s*$', line)
                    if m and m.group(2).strip() in chosen:
                        nxt = lines[i+1] if i+1 < len(lines) else ""
                        if "same_as:" not in nxt:
                            qid = chosen[m.group(2).strip()]
                            out.append(f'{m.group(1)}  same_as: "https://www.wikidata.org/wiki/{qid}"')
                            touched = True
            i += 1
        if touched:
            open(path, "w", encoding="utf-8").write("\n".join(out)); changed += 1
    print(f"เติม same_as แล้วใน {changed} ไฟล์ (จาก {len(chosen)} ชื่อที่ยืนยัน)")

cmds = {"list":cmd_list, "suggest":cmd_suggest, "apply":cmd_apply}
(cmds.get(sys.argv[1]) if len(sys.argv) > 1 else None or
 (lambda: print("ใช้: python3 suggest-sameas.py [list|suggest|apply]")))()

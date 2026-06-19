#!/usr/bin/env python3
# ดึงข้อเท็จจริงจาก Wikidata ผ่าน main API (wbgetentities) — เลี่ยง SPARQL ที่กำลัง outage
# ใช้ไลบรารีมาตรฐานล้วน ไม่ต้อง pip
# วิธีรัน:  python3 enrich-wikidata.py Q345494
import sys, json, time, urllib.parse, urllib.request, urllib.error

UA  = {"User-Agent": "SeizeTheDay/1.0 (noppadol@neogens.co)"}
API = "https://www.wikidata.org/w/api.php"

def get(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3:
                time.sleep(5); continue
            raise

def resolve_labels(qids, lang="en"):
    out = {}
    for i in range(0, len(qids), 50):  # wbgetentities รับได้สูงสุด 50 ids/ครั้ง
        d = get({"action":"wbgetentities","ids":"|".join(qids[i:i+50]),
                 "props":"labels","languages":lang,"format":"json"})
        for qid, ent in d.get("entities", {}).items():
            out[qid] = ent.get("labels", {}).get(lang, {}).get("value", qid)
    return out

QID = sys.argv[1] if len(sys.argv) > 1 else "Q345494"
d   = get({"action":"wbgetentities","ids":QID,
           "props":"labels|descriptions|claims|sitelinks",
           "languages":"en|th","format":"json"})
ent = d["entities"][QID]
claims = ent.get("claims", {})

def lbl(field, lang): return ent.get(field, {}).get(lang, {}).get("value")
def date(p):
    try:    return claims[p][0]["mainsnak"]["datavalue"]["value"]["time"][1:11]
    except Exception: return None
def ref_ids(p):
    res = []
    for c in claims.get(p, []):
        dv = c["mainsnak"].get("datavalue")
        if dv and isinstance(dv["value"], dict) and "id" in dv["value"]:
            res.append(dv["value"]["id"])
    return res
def image():
    try:
        f = claims["P18"][0]["mainsnak"]["datavalue"]["value"]
        return "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(f)
    except Exception: return None

occ  = resolve_labels(ref_ids("P106"))   # อาชีพ
work = resolve_labels(ref_ids("P800"))   # ผลงานเด่น
enwiki = ent.get("sitelinks", {}).get("enwiki", {}).get("url")

print(f"Q-id        : {QID}")
print(f"ชื่อ (en)    : {lbl('labels','en') or '—'}")
print(f"ชื่อ (th)    : {lbl('labels','th') or '—'}")
print(f"คำอธิบาย     : {lbl('descriptions','en') or '—'}   <- ใช้ยืนยัน disambiguation")
print(f"เกิด         : {date('P569') or '—'}")
print(f"เสีย         : {date('P570') or '—'}")
print(f"อาชีพ        : {', '.join(occ.values()) or '—'}")
print(f"ผลงานเด่น    : {', '.join(work.values()) or '—'}")
print(f"รูป          : {image() or '—'}")
print(f"Wikipedia    : {enwiki or '—'}")

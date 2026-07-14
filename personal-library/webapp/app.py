#!/usr/bin/env python3
"""
library-webapp — Personal Library (หนังสือ · แผ่นเสียง · CD · DVD)  ·  port 8700

Sibling product ของ pam-webapp บนกราฟ Neo4j เดียวกัน:
  * ใช้บัญชีผู้ใช้ (:AppUser) และ AI provider config (:AppConfig) ร่วมกัน —
    ลูกค้าตั้งค่าที่เดียว ใช้ได้ทั้งสอง app
  * Ontology โดเมน personal-library ถูก seed เป็น :SchemaLabel/:SchemaRelType
    สถานะ 'proposed' ตาม federation protocol — DAM app เห็นและ ratify ได้
  * LibraryItem เป็น :Artifact เสมอ → มูลค่ารวมเข้า net worth ของ DAM อัตโนมัติ

Design แยกจาก DAM: ของเยอะ (พันชิ้น) → list/shelf-first ไม่ใช่ graph-first,
pagination ทุก endpoint, Work/Copy dedupe ด้วย isbn/catalog_no
"""
import base64
import hashlib
import json
import os
import pathlib
import re
from contextlib import asynccontextmanager
from datetime import date, datetime

from fastapi import FastAPI, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from neo4j import GraphDatabase
from pydantic import BaseModel

import security as sec

# --------------------------------------------------------------------------
# Config (ร่วม path เดียวกับ pam-webapp)
# --------------------------------------------------------------------------
def _load_env():
    need = ["NEO4J_URI", "NEO4J_USER", "NEO4J_PASSWORD", "NEO4J_DATABASE"]
    if all(os.environ.get(k) for k in need[:3]):
        return {k: os.environ.get(k) for k in need}
    cfg = pathlib.Path.home() / ".openclaw" / "openclaw.json"
    if cfg.exists():
        try:
            env = json.loads(cfg.read_text())["skills"]["entries"][
                "personal-asset-manager"]["env"]
            return {k: env.get(k) for k in need}
        except (KeyError, json.JSONDecodeError):
            pass
    raise SystemExit("Neo4j credentials not found")

ENV = _load_env()
DB = ENV.get("NEO4J_DATABASE") or None
LABEL_RE = re.compile(r"^[A-Z][A-Za-z0-9]*$")
UPLOADS = pathlib.Path(__file__).parent / "uploads"
UPLOADS.mkdir(exist_ok=True)

MEDIA_TYPES = {
    "Book":        {"icon": "📚", "props": [
        ["isbn_13", False, "ISBN-13"], ["author_display", True, "ผู้เขียน"],
        ["publisher", False, ""], ["year", False, ""], ["language", False, ""],
        ["format", False, "hardcover/paperback"], ["pages", False, ""],
        ["edition", False, ""], ["series", False, ""]]},
    "VinylRecord": {"icon": "💿", "props": [
        ["artist_display", True, "ศิลปิน"], ["catalog_no", False, ""],
        ["label", False, "ค่ายเพลง"], ["year", False, ""],
        ["pressing", False, "first/repress/reissue"], ["rpm", False, "33/45/78"],
        ["size_inch", False, "12/10/7"], ["grading_media", False, "M/NM/VG+/VG/G"],
        ["grading_sleeve", False, "M/NM/VG+/VG/G"]]},
    "CompactDisc": {"icon": "💽", "props": [
        ["artist_display", True, "ศิลปิน"], ["catalog_no", False, ""],
        ["label", False, ""], ["year", False, ""], ["edition", False, ""],
        ["discs", False, "จำนวนแผ่น"]]},
    "DVD":         {"icon": "📀", "props": [
        ["director_display", False, "ผู้กำกับ"], ["catalog_no", False, ""],
        ["studio", False, ""], ["year", False, ""], ["region", False, ""],
        ["format", False, "DVD/Blu-ray/4K"], ["discs", False, ""]]},
}
GENRES_HINT = "jazz, classical, rock, thai, sci-fi, history, novel, art, film"

LIB_LABELS = [
    {"name": "LibraryItem", "kind": "branch", "parent": "Artifact"},
    *[{"name": n, "kind": "subtype", "parent": "LibraryItem"} for n in MEDIA_TYPES],
    {"name": "CreativeWork", "kind": "subtype", "parent": "Concept"},
]
LIB_RELS = [("COPY_OF", "LibraryItem", "CreativeWork"),
            ("CREATED_BY", "CreativeWork", "Person"),
            ("PUBLISHED_BY", "CreativeWork", "Organization"),
            ("SHELVED_AT", "LibraryItem", "Place"),
            ("LENT_TO", "LibraryItem", "Person"),
            ("ADAPTED_FROM", "CreativeWork", "CreativeWork"),
            # enrichment (addendum-01): ความสัมพันธ์บุคคล↔บุคคล และบุคคล↔แนวคิด
            ("ASSOCIATED_WITH", "Person", "Person"),
            ("KNOWN_FOR", "Person", "Concept")]

driver = None

def session():
    return driver.session(database=DB)

def _clean(v):
    if isinstance(v, (date, datetime)):
        return v.isoformat()
    if hasattr(v, "iso_format"):
        return v.iso_format()
    return v


def seed_library_schema(s):
    for l in LIB_LABELS:
        s.run("MERGE (x:SchemaLabel {name:$n}) "
              "ON CREATE SET x.kind=$k, x.parent=$p, x.status='proposed', "
              "x.props='[]', x.domain='personal-library', x.version='0.1.0', "
              "x.created_at=datetime()",
              n=l["name"], k=l["kind"], p=l["parent"])
    for name, f, t in LIB_RELS:
        s.run("MERGE (x:SchemaRelType {name:$n}) "
              "ON CREATE SET x.from_label=$f, x.to_label=$t, x.status='proposed', "
              "x.domain='personal-library', x.version='0.1.0', "
              "x.created_at=datetime()", n=name, f=f, t=t)
    s.run("CREATE CONSTRAINT lib_item_id IF NOT EXISTS "
          "FOR (n:LibraryItem) REQUIRE n.item_id IS UNIQUE")


def _verify_cover_prop(props: dict):
    """ตรวจ cover_url ก่อนเขียนลง graph — ลิงก์ตายถูกตัดทิ้ง, openlibrary ถูก normalize"""
    url = props.get("cover_url")
    if not url:
        return
    import httpx
    try:
        with httpx.Client(headers=UA) as cl:
            ok = _img_ok(cl, url)
    except Exception:                                       # noqa: BLE001
        ok = url                                            # เน็ตล่ม → ปล่อยผ่าน ไม่บล็อกผู้ใช้
    if ok:
        props["cover_url"] = ok
    else:
        props.pop("cover_url", None)


def cleanup_covers(s):
    """ไล่ตรวจ/ซ่อม cover_url เก่าตอน start — หนังสือที่มี ISBN ลอง Amazon ก่อนเสมอ"""
    rows = list(s.run(
        "MATCH (i:LibraryItem) WHERE i.cover_url IS NOT NULL "
        "OR (i:Book AND i.isbn_13 IS NOT NULL) "
        "RETURN elementId(i) AS id, i.cover_url AS u, i.isbn_13 AS isbn, "
        "(i:Book) AS is_book LIMIT 100"))
    if not rows:
        return
    import httpx
    with httpx.Client(headers=UA) as cl:
        for r in rows:
            best = ""
            if r["is_book"] and r["isbn"]:
                az = amazon_cover(r["isbn"])
                best = _img_ok(cl, az) if az else ""
            if best:
                if best != r["u"]:
                    s.run("MATCH (i) WHERE elementId(i)=$id SET i.cover_url=$u",
                          id=r["id"], u=best)
                continue
            if not r["u"]:
                continue
            ok = _img_ok(cl, r["u"])
            if not ok:
                s.run("MATCH (i) WHERE elementId(i)=$id REMOVE i.cover_url "
                      "SET i.cover_url_removed=$u", id=r["id"], u=r["u"])
            elif ok != r["u"]:
                s.run("MATCH (i) WHERE elementId(i)=$id SET i.cover_url=$u",
                      id=r["id"], u=ok)


def heal_works(s):
    """ซ่อมข้อมูลเก่า: item ที่ไม่มี work / work ที่ไม่มีผู้สร้าง (ใช้ชื่อจากช่อง display)"""
    for r in list(s.run(
            "MATCH (i:LibraryItem) WHERE NOT (i)-[:COPY_OF]->(:CreativeWork) "
            "AND i.title_display IS NOT NULL "
            "RETURN elementId(i) AS id, i.title_display AS t")):
        s.run("MERGE (w:Concept:CreativeWork {canonical_id:$wid}) "
              "ON CREATE SET w.name=$t "
              "WITH w MATCH (i) WHERE elementId(i)=$id MERGE (i)-[:COPY_OF]->(w)",
              wid=f"work:{_slug(r['t'])}", t=r["t"], id=r["id"])
    for r in list(s.run(
            "MATCH (i:LibraryItem)-[:COPY_OF]->(w:CreativeWork) "
            "WHERE NOT (w)-[:CREATED_BY]->(:Person) "
            "AND coalesce(i.author_display, i.artist_display, "
            "i.director_display) IS NOT NULL "
            "RETURN elementId(w) AS wid, coalesce(i.author_display, "
            "i.artist_display, i.director_display) AS names")):
        for name in str(r["names"]).split(",")[:6]:
            name = name.strip()
            if not name:
                continue
            s.run("MERGE (p:Person {canonical_id:$pid}) ON CREATE SET p.name=$n "
                  "WITH p MATCH (w) WHERE elementId(w)=$wid "
                  "MERGE (w)-[:CREATED_BY]->(p)",
                  pid=f"prov:personal-library:{_slug(name)}", n=name, wid=r["wid"])


@asynccontextmanager
async def lifespan(app):
    global driver
    driver = GraphDatabase.driver(ENV["NEO4J_URI"],
                                  auth=(ENV["NEO4J_USER"], ENV["NEO4J_PASSWORD"]))
    with session() as s:
        seed_library_schema(s)
        try:
            heal_works(s)
            cleanup_covers(s)
        except Exception:                                   # noqa: BLE001
            pass                                            # offline ก็ boot ได้
    yield
    driver.close()

app = FastAPI(title="library-webapp", lifespan=lifespan)

# --------------------------------------------------------------------------
# Auth — ใช้ :AppUser ร่วมกับ pam-webapp (module เดียวกัน copy มา)
# --------------------------------------------------------------------------
PUBLIC_API = {"/api/auth/status", "/api/auth/login"}


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    p = request.url.path
    if p.startswith("/api") and p not in PUBLIC_API:
        s = sec.get_session(request.cookies.get("lib_session"))
        if not s:
            return JSONResponse({"detail": "unauthorized"}, status_code=401)
        request.state.user = s["user"]
    return await call_next(request)


class LoginIn(BaseModel):
    username: str
    password: str
    otp: str = ""


@app.get("/api/auth/status")
def auth_status(request: Request):
    with session() as s:
        n = s.run("MATCH (u:AppUser) RETURN count(u) AS c").single()["c"]
    sess = sec.get_session(request.cookies.get("lib_session"))
    return {"setup_required": n == 0, "authenticated": bool(sess),
            "user": sess["user"] if sess else None,
            "note": "สร้างบัญชีที่ DAM app ครั้งเดียว ใช้ร่วมกันได้" if n == 0 else ""}


@app.post("/api/auth/login")
def auth_login(body: LoginIn, request: Request):
    username = body.username.strip().lower()
    key = f"{username}|{request.client.host if request.client else '?'}"
    wait = sec.is_locked(key)
    if wait:
        raise HTTPException(429, f"พยายามผิดหลายครั้ง — ลองใหม่ใน {wait} วินาที")
    with session() as s:
        rec = s.run("MATCH (u:AppUser {username:$u}) RETURN u", u=username).single()
    u = dict(rec["u"]) if rec else None
    if not u or not sec.verify_password(body.password, u.get("pw", "")):
        sec.register_fail(key)
        raise HTTPException(401, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
    if u.get("totp_enabled"):
        secret = sec.decrypt_secret(u.get("totp_secret", "") or "")
        if not (secret and sec.verify_totp(secret, body.otp)):
            sec.register_fail(key)
            raise HTTPException(401, "รหัส OTP ไม่ถูกต้อง")
    sec.clear_fails(key)
    token = sec.create_session(username)
    resp = JSONResponse({"ok": True, "user": username})
    resp.set_cookie("lib_session", token, httponly=True, samesite="strict",
                    secure=request.url.scheme == "https",
                    max_age=sec.SESSION_TTL, path="/")
    return resp


@app.post("/api/auth/logout")
def auth_logout(request: Request):
    sec.drop_session(request.cookies.get("lib_session"))
    resp = JSONResponse({"ok": True})
    resp.delete_cookie("lib_session", path="/")
    return resp


# --------------------------------------------------------------------------
# Items — paginated, list-first (ออกแบบเพื่อหลักพันชิ้น)
# --------------------------------------------------------------------------
class ItemIn(BaseModel):
    media_type: str
    props: dict = {}
    work: dict = {}            # {title, creators:[], publisher, first_year, genres:[]}
    shelf: str = ""            # e.g. "ตู้ A ชั้น 3"
    cover_hashes: list = []


def _slug(t):
    return re.sub(r"[^a-z0-9]+", "-", str(t).lower()).strip("-")[:60] or "x"


# ---- ตัวเลือกของฟิลด์แบบ list (ผู้ใช้เพิ่ม/ลบเองได้ เก็บใน graph) ----
_LANGS = ["ไทย", "English", "日本語", "中文", "Français", "Deutsch",
          "Español", "Italiano", "한국어"]
DEFAULT_FIELD_OPTIONS = {
    "Book.language": _LANGS, "CompactDisc.language": _LANGS,
    "DVD.language": _LANGS, "VinylRecord.language": _LANGS,
    "Book.format": ["hardcover (ปกแข็ง)", "paperback (ปกอ่อน)", "boxset"],
    "DVD.format": ["DVD", "Blu-ray", "4K UHD"],
    "VinylRecord.pressing": ["first pressing", "repress", "reissue"],
    "VinylRecord.rpm": ["33", "45", "78"],
    "VinylRecord.size_inch": ["12", "10", "7"],
    "VinylRecord.grading_media": ["M", "NM", "VG+", "VG", "G"],
    "VinylRecord.grading_sleeve": ["M", "NM", "VG+", "VG", "G"],
}


@app.get("/api/options")
def get_field_options():
    with session() as s:
        rec = s.run("MATCH (c:AppConfig {id:'field_options'}) "
                    "RETURN c.data AS d").single()
    custom = json.loads(rec["d"]) if rec and rec["d"] else {}
    return {"options": {**DEFAULT_FIELD_OPTIONS, **custom}}


class OptionsIn(BaseModel):
    key: str            # "<Type>.<field>" เช่น Book.format
    options: list


@app.put("/api/options")
def put_field_options(body: OptionsIn):
    if not re.match(r"^[A-Za-z]+\.[a-z_]+$", body.key):
        raise HTTPException(400, "bad key")
    opts = [str(o).strip() for o in body.options if str(o).strip()][:30]
    with session() as s:
        rec = s.run("MATCH (c:AppConfig {id:'field_options'}) "
                    "RETURN c.data AS d").single()
        custom = json.loads(rec["d"]) if rec and rec["d"] else {}
        custom[body.key] = opts
        s.run("MERGE (c:AppConfig {id:'field_options'}) SET c.data=$d",
              d=json.dumps(custom, ensure_ascii=False))
    return {"ok": True, "options": opts}


@app.get("/api/shelves")
def list_shelves():
    """ตำแหน่งจัดเก็บทั้งหมดที่ผู้ใช้เคยสร้าง (Place ของโดเมนนี้)"""
    with session() as s:
        rows = s.run("MATCH (p:Place) WHERE p.canonical_id STARTS WITH "
                     "'prov:personal-library:shelf-' AND p.name IS NOT NULL "
                     "RETURN DISTINCT p.name AS n ORDER BY n")
        return {"shelves": [r["n"] for r in rows]}


@app.get("/api/meta")
def meta():
    with session() as s:
        counts = {r["t"]: r["c"] for r in s.run(
            "MATCH (i:LibraryItem) WHERE coalesce(i.disposed,false)=false "
            "UNWIND [l IN labels(i) WHERE l IN $types] AS t "
            "RETURN t, count(*) AS c", types=list(MEDIA_TYPES))}
        val = s.run(
            "MATCH (i:LibraryItem) WHERE coalesce(i.disposed,false)=false "
            "RETURN sum(coalesce(i.cost_basis,0)) AS cost, count(i) AS n").single()
        lent = s.run("MATCH (:LibraryItem)-[l:LENT_TO]->() "
                     "WHERE coalesce(l.returned,false)=false "
                     "RETURN count(l) AS c").single()["c"]
        genres = [{"g": r["g"], "c": r["c"]} for r in s.run(
            "MATCH (i:LibraryItem)-[:ABOUT|EMBODIES]->(c:Concept) "
            "WHERE coalesce(i.disposed,false)=false "
            "RETURN c.name AS g, count(*) AS c ORDER BY c DESC LIMIT 12")]
    return {"types": {t: {"icon": MEDIA_TYPES[t]["icon"],
                          "count": counts.get(t, 0),
                          "props": MEDIA_TYPES[t]["props"]} for t in MEDIA_TYPES},
            "total": val["n"], "total_cost": val["cost"], "on_loan": lent,
            "genres": genres}


@app.get("/api/items")
def list_items(type: str = "", q: str = "", genre: str = "",
               disposed: bool = False,
               page: int = Query(1, ge=1), size: int = Query(60, le=200),
               sort: str = "added"):
    where = ["coalesce(i.disposed,false)=$disp"]
    params = {"skip": (page - 1) * size, "size": size, "disp": disposed}
    if type:
        if type not in MEDIA_TYPES:
            raise HTTPException(400, "bad type")
        where.append(f"i:`{type}`")
    if q:
        where.append("(toLower(coalesce(i.title_display,'')) CONTAINS toLower($q) "
                     "OR toLower(coalesce(i.author_display,'')) CONTAINS toLower($q) "
                     "OR toLower(coalesce(i.artist_display,'')) CONTAINS toLower($q) "
                     "OR coalesce(i.isbn_13,'') = $q OR coalesce(i.catalog_no,'') = $q)")
        params["q"] = q
    if genre:
        where.append("EXISTS { MATCH (i)-[:ABOUT|EMBODIES]->(:Concept {name:$genre}) }")
        params["genre"] = genre
    order = {"added": "i.created_at DESC", "title": "i.title_display",
             "year": "i.year DESC"}.get(sort, "i.created_at DESC")
    cy = (f"MATCH (i:LibraryItem) WHERE {' AND '.join(where)} "
          f"WITH i ORDER BY {order} SKIP $skip LIMIT $size "
          "OPTIONAL MATCH (e:Evidence:Image)-[:DEPICTS]->(i) "
          "WITH i, coalesce(i.cover_hash, collect(e.file_hash)[0]) AS cover "
          "OPTIONAL MATCH (i)-[:SHELVED_AT]->(p:Place) "
          "RETURN elementId(i) AS id, labels(i) AS labels, i AS props, "
          "cover, p.name AS shelf")
    cnt = f"MATCH (i:LibraryItem) WHERE {' AND '.join(where)} RETURN count(i) AS c"
    with session() as s:
        total = s.run(cnt, **params).single()["c"]
        rows = [{"id": r["id"], "labels": r["labels"],
                 "props": {k: _clean(v) for k, v in dict(r["props"]).items()},
                 "cover": r["cover"], "shelf": r["shelf"]}
                for r in s.run(cy, **params)]
    return {"items": rows, "total": total, "page": page, "size": size}


@app.get("/api/items/{eid}")
def get_item(eid: str):
    with session() as s:
        rec = s.run(
            "MATCH (i:LibraryItem) WHERE elementId(i)=$id "
            "OPTIONAL MATCH (i)-[:COPY_OF]->(w:Concept) "
            "OPTIONAL MATCH (w)-[:CREATED_BY]->(cr:Person) "
            "OPTIONAL MATCH (i)-[:SHELVED_AT]->(p:Place) "
            "OPTIONAL MATCH (i)-[l:LENT_TO]->(b:Person) "
            "  WHERE coalesce(l.returned,false)=false "
            "OPTIONAL MATCH (i)-[:ABOUT|EMBODIES]->(g:Concept) "
            "RETURN i, w, collect(DISTINCT cr.name) AS creators, p.name AS shelf, "
            "b.name AS lent_to, l.since AS lent_since, "
            "collect(DISTINCT g.name) AS genres", id=eid).single()
        if not rec:
            raise HTTPException(404, "item not found")
        photos = [r["h"] for r in s.run(
            "MATCH (e:Evidence:Image)-[:DEPICTS]->(i) WHERE elementId(i)=$id "
            "RETURN e.file_hash AS h", id=eid)]
        sibs = []
        if rec["w"]:
            sibs = [{"id": r["id"], "labels": r["l"], "title": r["t"]} for r in s.run(
                "MATCH (w:Concept) WHERE elementId(w)=$wid "
                "MATCH (o:LibraryItem)-[:COPY_OF]->(w) WHERE elementId(o)<>$id "
                "RETURN elementId(o) AS id, labels(o) AS l, o.title_display AS t",
                wid=rec["w"].element_id, id=eid)]
    i = rec["i"]
    return {"id": i.element_id, "labels": sorted(i.labels),
            "props": {k: _clean(v) for k, v in dict(i).items()},
            "work": ({k: _clean(v) for k, v in dict(rec["w"]).items()}
                     if rec["w"] else None),
            "creators": [c for c in rec["creators"] if c],
            "shelf": rec["shelf"], "lent_to": rec["lent_to"],
            "lent_since": _clean(rec["lent_since"]),
            "genres": [g for g in rec["genres"] if g],
            "photos": photos, "other_copies": sibs}


@app.post("/api/items")
def create_item(body: ItemIn):
    if body.media_type not in MEDIA_TYPES:
        raise HTTPException(400, f"media_type ต้องเป็น {list(MEDIA_TYPES)}")
    props = dict(body.props)
    title = props.get("title_display") or body.work.get("title")
    if not title:
        raise HTTPException(400, "ต้องมี title_display")
    props["title_display"] = title
    props.setdefault("disposed", False)
    props.setdefault("currency", "THB")
    if props.get("isbn_13"):                     # normalize: ตัวเลข 13 หลักล้วน
        props["isbn_13"] = re.sub(r"\D", "", str(props["isbn_13"]))
    _verify_cover_prop(props)                    # ลิงก์ปกตายไม่มีทางเข้า graph
    key = props.get("isbn_13") or props.get("catalog_no") or _slug(title)
    props.setdefault("item_id", f"lib:{body.media_type.lower()}:{_slug(key)}-"
                                f"{hashlib.sha256(os.urandom(8)).hexdigest()[:6]}")
    with session() as s:
        rec = s.run(
            f"CREATE (i:Artifact:LibraryItem:`{body.media_type}`) "
            "SET i=$props, i.created_at=datetime() "
            "MERGE (o:Person {canonical_id:$owner}) MERGE (o)-[:OWNS]->(i) "
            "RETURN elementId(i) AS id",
            props=props,
            owner=os.environ.get("ASSET_OWNER_ID",
                                 "prov:personal-assets:owner-noppadol")).single()
        eid = rec["id"]
        w = body.work
        if w.get("title"):
            wid = f"work:{_slug(w['title'])}"
            s.run("MERGE (wk:Concept:CreativeWork {canonical_id:$wid}) "
                  "ON CREATE SET wk.name=$t, wk.first_year=$y, wk.work_type=$wt "
                  "WITH wk MATCH (i) WHERE elementId(i)=$id "
                  "MERGE (i)-[:COPY_OF]->(wk)",
                  wid=wid, t=w["title"], y=w.get("first_year"),
                  wt={"Book": "book", "DVD": "film"}.get(body.media_type, "album"),
                  id=eid)
            for c in (w.get("creators") or [])[:6]:
                s.run("MERGE (p:Person {canonical_id:$cid}) ON CREATE SET p.name=$n "
                      "WITH p MATCH (wk:CreativeWork {canonical_id:$wid}) "
                      "MERGE (wk)-[:CREATED_BY]->(p)",
                      cid=f"prov:personal-library:{_slug(c)}", n=c, wid=wid)
            if w.get("publisher"):
                s.run("MERGE (o:Organization {canonical_id:$oid}) "
                      "ON CREATE SET o.name=$n "
                      "WITH o MATCH (wk:CreativeWork {canonical_id:$wid}) "
                      "MERGE (wk)-[:PUBLISHED_BY]->(o)",
                      oid=f"prov:personal-library:{_slug(w['publisher'])}",
                      n=w["publisher"], wid=wid)
            for g in (w.get("genres") or [])[:5]:
                s.run("MERGE (c:Concept {canonical_id:$cid}) ON CREATE SET c.name=$g "
                      "WITH c MATCH (i) WHERE elementId(i)=$id "
                      "MERGE (i)-[:ABOUT]->(c)",
                      cid=f"concept:{_slug(g)}", g=g.strip().lower(), id=eid)
        if body.shelf:
            s.run("MERGE (p:Place {canonical_id:$pid}) ON CREATE SET p.name=$n "
                  "WITH p MATCH (i) WHERE elementId(i)=$id "
                  "MERGE (i)-[:SHELVED_AT]->(p)",
                  pid=f"prov:personal-library:shelf-{_slug(body.shelf)}",
                  n=body.shelf, id=eid)
        for h in body.cover_hashes:
            if re.match(r"^[0-9a-f]{64}$", h):
                s.run("MATCH (i) WHERE elementId(i)=$id "
                      "MERGE (e:Evidence:Image {file_hash:$h}) "
                      "ON CREATE SET e.storage_uri=$u, e.snapshot_at=datetime() "
                      "MERGE (e)-[:DEPICTS]->(i)",
                      id=eid, h=h, u=f"uploads/{h}.jpg")
    return {"ok": True, "id": eid, "item_id": props["item_id"]}


class PropsIn(BaseModel):
    props: dict = {}
    shelf: str = None
    genres: list = None
    creators: list = None      # แทนที่ชุดผู้สร้างงานของ work (None = ไม่แตะ)


@app.patch("/api/items/{eid}")
def update_item(eid: str, body: PropsIn):
    if "cover_url" in body.props:
        if body.props["cover_url"]:
            _verify_cover_prop(body.props)
            if "cover_url" not in body.props:
                raise HTTPException(400, "ลิงก์รูปนี้เปิดไม่ได้/ไม่มีรูปจริง — ตรวจ URL อีกครั้ง")
        else:
            body.props["cover_url"] = None       # ล้างค่า = ลบลิงก์ปก
    with session() as s:
        rec = s.run("MATCH (i:LibraryItem) WHERE elementId(i)=$id "
                    "SET i += $p RETURN elementId(i) AS id",
                    id=eid, p=body.props).single()
        if not rec:
            raise HTTPException(404, "item not found")
        if body.shelf is not None:
            s.run("MATCH (i)-[r:SHELVED_AT]->() WHERE elementId(i)=$id DELETE r",
                  id=eid)
            if body.shelf:
                s.run("MERGE (p:Place {canonical_id:$pid}) ON CREATE SET p.name=$n "
                      "WITH p MATCH (i) WHERE elementId(i)=$id "
                      "MERGE (i)-[:SHELVED_AT]->(p)",
                      pid=f"prov:personal-library:shelf-{_slug(body.shelf)}",
                      n=body.shelf, id=eid)
        if body.genres is not None:
            s.run("MATCH (i)-[r:ABOUT|EMBODIES]->(:Concept) "
                  "WHERE elementId(i)=$id DELETE r", id=eid)
            for g in [x.strip().lower() for x in body.genres if x.strip()][:8]:
                s.run("MERGE (c:Concept {canonical_id:'concept:'+$slug}) "
                      "ON CREATE SET c.name=$g "
                      "WITH c MATCH (i) WHERE elementId(i)=$id "
                      "MERGE (i)-[:ABOUT]->(c)",
                      slug=_slug(g), g=g, id=eid)
        if body.creators is not None:
            # ensure work มีอยู่ แล้ว sync ชุด CREATED_BY ให้ตรงกับรายชื่อใหม่
            s.run("MATCH (i:LibraryItem) WHERE elementId(i)=$id "
                  "AND NOT (i)-[:COPY_OF]->(:CreativeWork) "
                  "MERGE (w:Concept:CreativeWork {canonical_id:'work:'+$slug}) "
                  "ON CREATE SET w.name=i.title_display "
                  "MERGE (i)-[:COPY_OF]->(w)",
                  id=eid, slug=_slug(body.props.get("title_display", "") or eid))
            s.run("MATCH (i)-[:COPY_OF]->(w)-[r:CREATED_BY]->() "
                  "WHERE elementId(i)=$id DELETE r", id=eid)
            for name in [c.strip() for c in body.creators if c.strip()][:6]:
                s.run("MERGE (p:Person {canonical_id:$pid}) ON CREATE SET p.name=$n "
                      "WITH p MATCH (i)-[:COPY_OF]->(w) WHERE elementId(i)=$id "
                      "MERGE (w)-[:CREATED_BY]->(p)",
                      pid=f"prov:personal-library:{_slug(name)}", n=name, id=eid)
    return {"ok": True}


@app.post("/api/items/{eid}/lend")
def lend_item(eid: str, borrower: str = Form(...), returned: bool = Form(False)):
    with session() as s:
        if returned:
            s.run("MATCH (i)-[l:LENT_TO]->() WHERE elementId(i)=$id "
                  "SET l.returned=true, l.returned_at=date()", id=eid)
            return {"ok": True, "status": "returned"}
        s.run("MATCH (i:LibraryItem) WHERE elementId(i)=$id "
              "MERGE (p:Person {canonical_id:$pid}) ON CREATE SET p.name=$n "
              "MERGE (i)-[l:LENT_TO]->(p) SET l.since=date(), l.returned=false",
              id=eid, pid=f"prov:personal-library:{_slug(borrower)}", n=borrower)
    return {"ok": True, "status": "lent"}


@app.post("/api/items/{eid}/dispose")
def dispose_item(eid: str, restore: bool = False):
    with session() as s:
        rec = s.run("MATCH (i:LibraryItem) WHERE elementId(i)=$id "
                    "SET i.disposed=$f RETURN i", id=eid, f=not restore).single()
        if not rec:
            raise HTTPException(404, "item not found")
    return {"ok": True, "disposed": not restore}


@app.delete("/api/items/{eid}")
def hard_delete_item(eid: str, confirm: str = ""):
    with session() as s:
        rec = s.run("MATCH (i:LibraryItem) WHERE elementId(i)=$id "
                    "RETURN coalesce(i.title_display,'') AS t", id=eid).single()
        if not rec:
            raise HTTPException(404, "item not found")
        if confirm != rec["t"]:
            raise HTTPException(400, f"พิมพ์ชื่อให้ตรงเพื่อยืนยัน: {rec['t']}")
        s.run("MATCH (i) WHERE elementId(i)=$id DETACH DELETE i", id=eid)
    return {"ok": True}


# --------------------------------------------------------------------------
# External lookup — แหล่งอ้างอิงที่เชื่อถือได้ (ไม่ต้องมี key ยกเว้น Discogs)
#   Book:  Google Books → Open Library (fallback)
#   Music: Discogs (ถ้าตั้ง DISCOGS_TOKEN) → MusicBrainz (fallback, ฟรี)
# --------------------------------------------------------------------------
# Wikimedia robot policy ต้องการ UA ที่ระบุแอป+ช่องทางติดต่อ (https://w.wiki/4wJS)
UA = {"User-Agent": "PersonalLibrary/0.2 "
                    "(personal home library; contact: noppadol@neogens.co) "
                    "python-httpx"}


def _isbn10(isbn13: str) -> str:
    s = re.sub(r"\D", "", str(isbn13 or ""))
    if len(s) != 13 or not s.startswith("978"):
        return ""
    core = s[3:12]
    total = sum((10 - i) * int(d) for i, d in enumerate(core))
    chk = (11 - total % 11) % 11
    return core + ("X" if chk == 10 else str(chk))


def amazon_cover(isbn13: str) -> str:
    """Amazon product image by ISBN-10 — ไม่มีรูป = ตอบ gif จิ๋ว ซึ่ง _img_ok คัดทิ้งเอง"""
    i10 = _isbn10(isbn13)
    return (f"https://images-na.ssl-images-amazon.com/images/P/{i10}"
            ".01.LZZZZZZZ.jpg") if i10 else ""


def _img_ok(client, url: str) -> str:
    """คืน URL เดิมถ้ารูปมีจริง (status 200 + content-type image) ไม่งั้นคืน '' """
    if not url:
        return ""
    u = url
    if "covers.openlibrary.org" in u and "default=false" not in u:
        u += ("&" if "?" in u else "?") + "default=false"   # ให้ 404 แทนรูป placeholder
    try:
        r = client.head(u, follow_redirects=True, timeout=4)
        if r.status_code in (405, 403):                     # host ไม่รับ HEAD
            r = client.get(u, follow_redirects=True, timeout=5)
        if (r.status_code == 200
                and r.headers.get("content-type", "").startswith("image")
                and int(r.headers.get("content-length") or 9999) > 1200):
            return u
    except Exception:                                       # noqa: BLE001
        pass
    return ""


# ---- autocomplete จากข้อมูลที่มีอยู่ในระบบ (พิมพ์ ≥ 3 ตัวอักษร) ----
SUGGEST_FIELDS = {
    "author_display": ("LibraryItem", "author_display"),
    "artist_display": ("LibraryItem", "artist_display"),
    "director_display": ("LibraryItem", "director_display"),
    "publisher": ("LibraryItem", "publisher"),
    "label": ("LibraryItem", "label"),
    "studio": ("LibraryItem", "studio"),
    "series": ("LibraryItem", "series"),
    "language": ("LibraryItem", "language"),
    "format": ("LibraryItem", "format"),
    "creators": ("Person", "name"),
    "genres": ("Concept", "name"),
    "shelf": ("Place", "name"),
}


@app.get("/api/suggest")
def suggest(field: str, q: str = ""):
    if field not in SUGGEST_FIELDS or len(q.strip()) < 3:
        return {"values": []}
    lab, prop = SUGGEST_FIELDS[field]
    with session() as s:
        rows = s.run(
            f"MATCH (n:`{lab}`) WHERE n.`{prop}` IS NOT NULL "
            f"AND toLower(toString(n.`{prop}`)) CONTAINS toLower($q) "
            f"RETURN DISTINCT toString(n.`{prop}`) AS v ORDER BY v LIMIT 8",
            q=q.strip())
        return {"values": [r["v"] for r in rows]}


@app.get("/api/lookup")
def lookup(type: str = "Book", isbn: str = "", q: str = "", artist: str = ""):
    if type not in MEDIA_TYPES:
        raise HTTPException(400, "bad type")
    if not (isbn or q):
        raise HTTPException(400, "ต้องมี isbn/barcode หรือคำค้น")
    import httpx
    out = []
    try:
        if type == "Book":
            query = f"isbn:{isbn}" if isbn else q
            # หนังสือไทย: มักมีคำไทยในชื่อ/คำค้น → ระบุ country=TH + langRestrict=th
            #   ค้นแบบ locale ไทยก่อน ถ้าไม่เจอค่อย fallback แบบไม่ล็อกภาษา
            thai_hint = bool(re.search(r"[฀-๿]", q)) or \
                (isbn and re.sub(r"\D", "", str(isbn)).startswith(("97861", "978616",
                                                                   "978974", "978616")))
            attempts = []
            if thai_hint:
                attempts.append({"q": query, "maxResults": 5, "country": "TH",
                                 "langRestrict": "th"})
            attempts.append({"q": query, "maxResults": 5, "country": "TH"})
            items = []
            for params_g in attempts:
                r = httpx.get("https://www.googleapis.com/books/v1/volumes",
                              params=params_g, headers=UA, timeout=15)
                items = r.json().get("items") or []
                if items:
                    break
            for it in items[:5]:
                v = it.get("volumeInfo", {})
                i13 = next((x["identifier"] for x in v.get("industryIdentifiers", [])
                            if x.get("type") == "ISBN_13"), isbn)
                out.append({"source": "Google Books", "title": v.get("title", ""),
                            "by": ", ".join(v.get("authors", [])),
                            "year": (v.get("publishedDate") or "")[:4],
                            "publisher": v.get("publisher", ""),
                            "cover_url": ((v.get("imageLinks") or {}).get("thumbnail", "")
                                          ).replace("http://", "https://"),
                            "fields": {"isbn_13": i13,
                                       "pages": v.get("pageCount"),
                                       "language": v.get("language", ""),
                                       "genres": v.get("categories", [])}})
            if not out and isbn:
                r = httpx.get(f"https://openlibrary.org/isbn/{isbn}.json",
                              headers=UA, timeout=15, follow_redirects=True)
                if r.status_code == 200:
                    j = r.json()
                    authors = []
                    for a in (j.get("authors") or [])[:3]:
                        try:                        # OL เก็บชื่อผู้แต่งแยก endpoint
                            ar = httpx.get("https://openlibrary.org"
                                           f"{a.get('key','')}.json",
                                           headers=UA, timeout=8)
                            nm = ar.json().get("name")
                            if nm:
                                authors.append(nm)
                        except Exception:           # noqa: BLE001
                            pass
                    subjects = j.get("subjects") or []
                    if not subjects:                # subjects อยู่ระดับ work
                        wk = ((j.get("works") or [{}])[0]).get("key")
                        if wk:
                            try:
                                wj = httpx.get(f"https://openlibrary.org{wk}.json",
                                               headers=UA, timeout=8).json()
                                subjects = wj.get("subjects") or []
                            except Exception:       # noqa: BLE001
                                pass
                    # คัดหัวข้อสั้นอ่านง่ายก่อน (ตัดพวก "Photography, artistic" ยาวๆ ทีหลัง)
                    subjects = sorted(subjects, key=len)[:3]
                    out.append({"source": "Open Library", "title": j.get("title", ""),
                                "by": ", ".join(authors),
                                "year": (j.get("publish_date") or "")[-4:],
                                "publisher": ", ".join(j.get("publishers", [])[:2]),
                                "cover_url": f"https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg",
                                "fields": {"isbn_13": isbn,
                                           "pages": j.get("number_of_pages"),
                                           "genres": subjects}})
        else:
            token = os.environ.get("DISCOGS_TOKEN")
            if token:
                params = {"token": token, "type": "release", "per_page": 5}
                fmt = {"VinylRecord": "Vinyl", "CompactDisc": "CD",
                       "DVD": "DVD"}.get(type)
                if fmt:
                    params["format"] = fmt
                if isbn:
                    params["barcode"] = isbn
                else:
                    params["q"] = f"{artist} {q}".strip()
                r = httpx.get("https://api.discogs.com/database/search",
                              params=params, headers=UA, timeout=15)
                for it in (r.json().get("results") or [])[:5]:
                    out.append({"source": "Discogs", "title": it.get("title", ""),
                                "by": "", "year": str(it.get("year") or ""),
                                "publisher": ", ".join((it.get("label") or [])[:2]),
                                "cover_url": it.get("cover_image", ""),
                                "fields": {"catalog_no": it.get("catno", ""),
                                           "genres": it.get("genre", [])}})
            if not out:
                query = (f"barcode:{isbn}" if isbn else
                         f'release:"{q}"' + (f' AND artist:"{artist}"' if artist else ""))
                r = httpx.get("https://musicbrainz.org/ws/2/release/",
                              params={"query": query, "fmt": "json", "limit": 5},
                              headers=UA, timeout=15)
                for rel in (r.json().get("releases") or [])[:5]:
                    li = ((rel.get("label-info") or [{}])[0])
                    out.append({"source": "MusicBrainz", "title": rel.get("title", ""),
                                "by": ", ".join(a.get("name", "") for a in
                                                rel.get("artist-credit", [])
                                                if isinstance(a, dict)),
                                "year": (rel.get("date") or "")[:4],
                                "publisher": ((li.get("label") or {}).get("name", "")),
                                "cover_url": f"https://coverartarchive.org/release/{rel.get('id')}/front-250",
                                "fields": {"catalog_no": li.get("catalog-number", "")}})
    except httpx.HTTPError as e:
        raise HTTPException(502, f"ค้นหาแหล่งข้อมูลไม่สำเร็จ: {str(e)[:100]}")
    with httpx.Client(headers=UA) as cl:                # ตรวจรูปปกจริงก่อนส่งกลับ
        for c in out:
            best = ""
            if type == "Book":                          # Amazon เป็นแหล่งรูปลำดับแรก
                az = amazon_cover(c["fields"].get("isbn_13") or isbn)
                best = _img_ok(cl, az) if az else ""
            c["cover_url"] = best or _img_ok(cl, c.get("cover_url", ""))
            if best:
                c["cover_source"] = "Amazon"
    return {"candidates": out}


# --------------------------------------------------------------------------
# Enrichment — ดึงข้อมูลบุคคลจาก Wikidata/Wikipedia แล้วเสนอความสัมพันธ์
#   (ผู้ใช้ตรวจก่อน apply เสมอ · ทุกอย่างที่เขียนติด source + enriched_at)
# --------------------------------------------------------------------------
WD = "https://www.wikidata.org/w/api.php"
WD_RELS = {"P26": "spouse", "P451": "partner", "P737": "influenced_by",
           "P1327": "collaborator"}


def _wd_year(claims, pid):
    try:
        t = claims[pid][0]["mainsnak"]["datavalue"]["value"]["time"]
        return int(t[1:5])
    except (KeyError, IndexError, ValueError, TypeError):
        return None


def _wd_qids(claims, pid, limit=5):
    out = []
    for c in claims.get(pid, [])[:limit]:
        try:
            out.append(c["mainsnak"]["datavalue"]["value"]["id"])
        except (KeyError, TypeError):
            pass
    return out


@app.get("/api/person")
def get_person(name: str):
    """โปรไฟล์บุคคลจาก graph: ประวัติ (ถ้า enrich แล้ว) + ความสัมพันธ์ + งานที่มี"""
    pid = f"prov:personal-library:{_slug(name)}"
    with session() as s:
        rec = s.run("MATCH (p:Person) WHERE p.canonical_id=$pid OR p.name=$n "
                    "RETURN p LIMIT 1", pid=pid, n=name).single()
        if not rec:
            raise HTTPException(404, "ไม่พบบุคคลนี้ใน graph")
        p = rec["p"]
        eid = p.element_id
        assoc = [r.data() for r in s.run(
            "MATCH (p)-[r:ASSOCIATED_WITH]-(p2:Person) WHERE elementId(p)=$id "
            "RETURN p2.name AS name, r.relation AS relation, r.source AS source",
            id=eid)]
        concepts = [r["n"] for r in s.run(
            "MATCH (p)-[:KNOWN_FOR]->(c:Concept) WHERE elementId(p)=$id "
            "RETURN c.name AS n", id=eid)]
        works = [r.data() for r in s.run(
            "MATCH (p)<-[:CREATED_BY]-(:CreativeWork)<-[:COPY_OF]-(i:LibraryItem) "
            "WHERE elementId(p)=$id AND coalesce(i.disposed,false)=false "
            "RETURN elementId(i) AS id, i.title_display AS title", id=eid)]
    return {"props": {k: _clean(v) for k, v in dict(p).items()},
            "associations": assoc, "concepts": concepts, "works": works}


@app.get("/api/enrich/person")
async def enrich_person(name: str):
    if not name.strip():
        raise HTTPException(400, "ต้องระบุชื่อ")
    import asyncio

    import httpx
    timeout = httpx.Timeout(8.0, connect=4.0)     # เพดานรวม ~เร็วกว่าเดิม 4 เท่า

    def _json(resp, what):
        try:
            return resp.json()
        except ValueError:
            raise HTTPException(502, f"{what} ตอบ HTTP {resp.status_code} "
                                     f"ไม่ใช่ JSON: {resp.text[:80]!r}")

    headers = {**UA, "Accept": "application/json"}
    try:
        async with httpx.AsyncClient(headers=headers, timeout=timeout,
                                     follow_redirects=True) as cl:
            sr = _json(await cl.get(WD, params={
                "action": "wbsearchentities", "search": name, "language": "en",
                "type": "item", "format": "json", "limit": 1}),
                "Wikidata search")
            hits = sr.get("search", [])
            if not hits:
                raise HTTPException(404, f"ไม่พบ '{name}' ใน Wikidata")
            qid = hits[0]["id"]
            ent = _json(await cl.get(WD, params={
                "action": "wbgetentities", "ids": qid,
                "props": "claims|descriptions|sitelinks",
                "format": "json"}), "Wikidata entity")["entities"][qid]
            claims = ent.get("claims", {})
            desc = (ent.get("descriptions", {}).get("en") or {}).get("value", "")
            assoc_q = {q: rel for pid, rel in WD_RELS.items()
                       for q in _wd_qids(claims, pid)}
            occ_q = _wd_qids(claims, "P106", 6)
            all_q = list(assoc_q) + occ_q
            title = (ent.get("sitelinks", {}).get("enwiki") or {}).get("title")

            async def get_bio():
                if not title:
                    return "", ""
                try:
                    w = await cl.get(
                        "https://en.wikipedia.org/api/rest_v1/page/summary/"
                        + title.replace(" ", "_"))
                    if w.status_code == 200:
                        j = w.json()
                        return ((j.get("extract") or "")[:600],
                                j.get("content_urls", {}).get("desktop", {})
                                .get("page", ""))
                except (httpx.HTTPError, ValueError):
                    pass                                    # bio เป็น optional
                return "", ""

            async def get_labels():
                if not all_q:
                    return {}
                try:
                    le = (await cl.get(WD, params={
                        "action": "wbgetentities", "ids": "|".join(all_q[:40]),
                        "props": "labels", "languages": "en",
                        "format": "json"})).json()["entities"]
                    return {q: (v.get("labels", {}).get("en") or {})
                            .get("value", "") for q, v in le.items()}
                except (httpx.HTTPError, ValueError, KeyError):
                    return {}

            (bio, wp_url), labels = await asyncio.gather(get_bio(), get_labels())
            return {"qid": qid, "name": hits[0].get("label", name),
                    "description": desc, "bio": bio, "wikipedia_url": wp_url,
                    "birth_year": _wd_year(claims, "P569"),
                    "death_year": _wd_year(claims, "P570"),
                    "associations": [{"name": labels.get(q, ""), "relation": rel,
                                      "qid": q} for q, rel in assoc_q.items()
                                     if labels.get(q)],
                    "concepts": [labels[q] for q in occ_q if labels.get(q)]}
    except HTTPException:
        raise
    except httpx.TimeoutException:
        raise HTTPException(504, "Wikidata ตอบช้าเกินไป — ลองใหม่อีกครั้ง "
                                 "(ถ้าเป็นบ่อย เช็กเน็ตของ Pi)")
    except Exception as e:                                  # noqa: BLE001
        raise HTTPException(502, f"ดึงข้อมูลไม่สำเร็จ: {str(e)[:120]}")


class EnrichApply(BaseModel):
    person_name: str
    qid: str = ""
    bio: str = ""
    wikipedia_url: str = ""
    birth_year: int | None = None
    death_year: int | None = None
    associations: list = []     # [{name, relation}]
    concepts: list = []         # ["photographer", ...]


@app.post("/api/enrich/person/apply")
def enrich_apply(body: EnrichApply):
    pid = f"prov:personal-library:{_slug(body.person_name)}"
    with session() as s:
        s.run("MERGE (p:Person {canonical_id:$pid}) "
              "ON CREATE SET p.name=$name "
              "SET p.short_bio=$bio, p.birth_year=$by, p.death_year=$dy, "
              "p.wikidata_id=$qid, p.enriched_from=$src, p.enriched_at=datetime()",
              pid=pid, name=body.person_name, bio=body.bio[:600],
              by=body.birth_year, dy=body.death_year, qid=body.qid,
              src=body.wikipedia_url or "wikidata")
        for a in body.associations[:10]:
            if not a.get("name"):
                continue
            aid = f"prov:personal-library:{_slug(a['name'])}"
            s.run("MERGE (p2:Person {canonical_id:$aid}) ON CREATE SET p2.name=$n "
                  "WITH p2 MATCH (p:Person {canonical_id:$pid}) "
                  "MERGE (p)-[r:ASSOCIATED_WITH]->(p2) "
                  "SET r.relation=$rel, r.source='wikidata', r.status='asserted'",
                  aid=aid, n=a["name"], pid=pid,
                  rel=a.get("relation", "associated"))
        for cname in body.concepts[:8]:
            cid = f"concept:{_slug(cname)}"
            s.run("MERGE (c:Concept {canonical_id:$cid}) ON CREATE SET c.name=$n "
                  "WITH c MATCH (p:Person {canonical_id:$pid}) "
                  "MERGE (p)-[r:KNOWN_FOR]->(c) SET r.source='wikidata'",
                  cid=cid, n=cname.strip().lower(), pid=pid)
        # หา connection กับ asset อื่นของผู้ใช้ (library + DAM ใน graph เดียวกัน)
        try:
            conns = [r["finding"] for r in s.run(
                "MATCH (p:Person {canonical_id:$pid}) "
                "CALL (p) { "
                "  MATCH (p)-[:ASSOCIATED_WITH]-(p2:Person)"
                "<-[:CREATED_BY]-(:CreativeWork)<-[:COPY_OF]-(i:LibraryItem) "
                "  RETURN 'งานของ '+p2.name+' ที่คุณมี: '+i.title_display AS finding "
                "UNION "
                "  MATCH (p)-[:KNOWN_FOR]->(c:Concept)"
                "<-[:ABOUT|EMBODIES|KNOWN_FOR]-(x) "
                "  WHERE x.canonical_id <> $pid AND NOT x:SchemaLabel "
                "  RETURN 'เชื่อมผ่านแนวคิด '+c.name+' → '+"
                "coalesce(x.title_display,x.name,'') AS finding "
                "UNION "
                "  MATCH (p)-[:ASSOCIATED_WITH]-(p2:Person)-[:OWNS|BENEFITS]-(a) "
                "  WHERE NOT a:SchemaLabel "
                "  RETURN 'บุคคลเกี่ยวข้อง '+p2.name+' ผูกกับ asset: '+"
                "coalesce(a.name, a.title_display, '') AS finding "
                "} RETURN DISTINCT finding LIMIT 12", pid=pid)]
        except Exception:                                   # noqa: BLE001
            conns = []          # การเขียนสำเร็จแล้ว — connection report เป็น optional
    return {"ok": True, "person": pid,
            "connections": [c for c in conns if c]}


# --------------------------------------------------------------------------
# Drill-down view — หมวดหมู่เป็นชั้น (รองรับหลักพันเล่ม)
#   root → ประเภทสื่อ (นับ) → หมวดหมู่ (นับ) → รายการ
# --------------------------------------------------------------------------
@app.get("/api/graph/drill")
def graph_drill(level: str = "root", type: str = "", genre: str = ""):
    with session() as s:
        if level == "root":
            rows = list(s.run(
                "MATCH (i:LibraryItem) WHERE coalesce(i.disposed,false)=false "
                "UNWIND [l IN labels(i) WHERE l IN $t] AS mt "
                "RETURN mt AS k, count(*) AS c ORDER BY c DESC",
                t=list(MEDIA_TYPES)))
            return {"level": "root", "children": [
                {"key": r["k"], "label": f"{MEDIA_TYPES[r['k']]['icon']} {r['k']}",
                 "count": r["c"], "kind": "type"} for r in rows]}
        if level == "genres":            # หมวดหมู่รวมทุกประเภทสื่อ
            rows = list(s.run(
                "MATCH (i:LibraryItem)-[:ABOUT|EMBODIES]->(c:Concept) "
                "WHERE coalesce(i.disposed,false)=false "
                "RETURN c.name AS k, count(DISTINCT i) AS c "
                "ORDER BY c DESC, k LIMIT 60"))
            unc = s.run(
                "MATCH (i:LibraryItem) WHERE coalesce(i.disposed,false)=false "
                "AND NOT (i)-[:ABOUT|EMBODIES]->(:Concept) "
                "RETURN count(i) AS c").single()["c"]
            children = [{"key": r["k"], "label": r["k"], "count": r["c"],
                         "kind": "genre"} for r in rows]
            if unc:
                children.append({"key": "(ยังไม่จัดหมวด)",
                                 "label": "(ยังไม่จัดหมวด)", "count": unc,
                                 "kind": "genre"})
            return {"level": "genres", "children": children}
        if type and type not in MEDIA_TYPES:
            raise HTTPException(400, "bad type")
        if level == "type":
            if not type:
                raise HTTPException(400, "bad type")
            rows = list(s.run(
                f"MATCH (i:`{type}`) WHERE coalesce(i.disposed,false)=false "
                "OPTIONAL MATCH (i)-[:ABOUT|EMBODIES]->(c:Concept) "
                "WITH coalesce(c.name,'(ยังไม่จัดหมวด)') AS g, "
                "count(DISTINCT i) AS n RETURN g AS k, n AS c "
                "ORDER BY c DESC, k LIMIT 40"))
            return {"level": "type", "type": type, "children": [
                {"key": r["k"], "label": r["k"], "count": r["c"],
                 "kind": "genre"} for r in rows]}
        if level == "genre":
            base = f"(i:`{type}`)" if type else "(i:LibraryItem)"
            if genre == "(ยังไม่จัดหมวด)":
                cy = (f"MATCH {base} WHERE coalesce(i.disposed,false)=false "
                      "AND NOT (i)-[:ABOUT|EMBODIES]->(:Concept) ")
                params = {}
            else:
                cy = (f"MATCH {base} WHERE coalesce(i.disposed,false)=false "
                      "AND EXISTS { MATCH (i)-[:ABOUT|EMBODIES]->"
                      "(:Concept {name:$g}) } ")
                params = {"g": genre}
            rows = list(s.run(
                cy + "OPTIONAL MATCH (e:Evidence:Image)-[:DEPICTS]->(i) "
                "WITH i, coalesce(i.cover_hash, collect(e.file_hash)[0]) AS cv "
                "RETURN elementId(i) AS id, i.title_display AS t, "
                "coalesce(i.author_display,i.artist_display,"
                "i.director_display,'') AS by, cv, i.cover_url AS cu "
                "ORDER BY i.title_display LIMIT 120", **params))
            return {"level": "genre", "type": type, "genre": genre, "children": [
                {"key": r["id"], "label": r["t"], "by": r["by"],
                 "cover": r["cv"], "cover_url": r["cu"], "count": 1,
                 "kind": "item"} for r in rows]}
    raise HTTPException(400, "bad level")


# --------------------------------------------------------------------------
# Knowledge graph view — โหมดสำรวจ (fold work ที่มี copy เดียวเข้าตัวเล่ม)
# --------------------------------------------------------------------------
@app.get("/api/graph")
def library_graph(type: str = "", q: str = "", limit: int = Query(150, le=400)):
    where = ["coalesce(i.disposed,false)=false"]
    params = {"limit": limit}
    if type:
        if type not in MEDIA_TYPES:
            raise HTTPException(400, "bad type")
        where.append(f"i:`{type}`")
    if q:
        where.append("(toLower(coalesce(i.title_display,'')) CONTAINS toLower($q) "
                     "OR toLower(coalesce(i.author_display,'')) CONTAINS toLower($q) "
                     "OR toLower(coalesce(i.artist_display,'')) CONTAINS toLower($q))")
        params["q"] = q
    cy = (f"MATCH (i:LibraryItem) WHERE {' AND '.join(where)} "
          "WITH i LIMIT $limit "
          "OPTIONAL MATCH (i)-[r:SHELVED_AT|ABOUT|EMBODIES|LENT_TO]->(m) "
          "OPTIONAL MATCH (i)-[:COPY_OF]->(w:CreativeWork) "
          "OPTIONAL MATCH (w)-[r2:CREATED_BY|PUBLISHED_BY]->(m2) "
          "OPTIONAL MATCH (w)-[:CREATED_BY]->(:Person)"
          "-[r3:ASSOCIATED_WITH|KNOWN_FOR]->(m3) "
          "OPTIONAL MATCH (w)<-[:COPY_OF]-(cc:LibraryItem) "
          "RETURN collect(DISTINCT i) AS items, "
          "collect(DISTINCT {r:r, a:elementId(i), b:elementId(m), t:type(r), m:m}) AS l1, "
          "collect(DISTINCT {i:elementId(i), w:w, copies:count{ (w)<-[:COPY_OF]-() }}) AS iw, "
          "collect(DISTINCT {r:r2, a:elementId(w), b:elementId(m2), t:type(r2), m:m2}) AS l2, "
          "collect(DISTINCT {r:r3, a:elementId(startNode(r3)), b:elementId(m3), "
          "t:type(r3), m:m3}) AS l3")
    nodes, rels, seen = [], [], set()

    def add_node(n):
        if n is None or n.element_id in seen:
            return
        seen.add(n.element_id)
        nodes.append({"id": n.element_id, "labels": sorted(n.labels),
                      "props": {k: _clean(v) for k, v in dict(n).items()}})
    with session() as s:
        rec = s.run(cy, **params).single()
        for i in rec["items"]:
            add_node(i)
        # Work/Copy fold: งานที่มี copy เดียว → ไม่แสดงโหนดงาน เส้นของงานย้ายมาที่ตัวเล่ม
        remap = {}                       # work_eid -> item_eid (เมื่อ fold)
        for link in rec["iw"]:
            w = link["w"]
            if w is None:
                continue
            if link["copies"] <= 1:
                remap[w.element_id] = link["i"]
            else:                        # หลาย copy → โชว์โหนดงานเป็น hub
                add_node(w)
                rels.append({"from": link["i"], "to": w.element_id,
                             "type": "COPY_OF"})
        for link in (rec["l1"] + rec["l2"] + rec["l3"]):
            if link["r"] is None:
                continue
            add_node(link["m"])
            a = remap.get(link["a"], link["a"])
            b = remap.get(link["b"], link["b"])
            if a in seen and b in seen and a != b:
                rels.append({"from": a, "to": b, "type": link["t"]})
        # กันเส้นซ้ำ
        uniq = {(r["from"], r["to"], r["type"]): r for r in rels}
        rels = list(uniq.values())
    return {"nodes": nodes, "rels": rels}


# --------------------------------------------------------------------------
# Photos (ปก) + Vision intake — ใช้ AppConfig 'ai' ร่วมกับ DAM
# --------------------------------------------------------------------------
@app.delete("/api/items/{eid}/photo/{h}")
def del_item_photo(eid: str, h: str):
    if not re.match(r"^[0-9a-f]{64}$", h):
        raise HTTPException(400, "bad hash")
    with session() as s:
        s.run("MATCH (e:Evidence:Image {file_hash:$h})-[d:DEPICTS]->(i) "
              "WHERE elementId(i)=$id DELETE d "
              "WITH e WHERE NOT (e)-[:DEPICTS]->() DETACH DELETE e", h=h, id=eid)
        # ถ้ารูปที่ลบเป็นภาพปกอยู่ ให้ล้าง cover_hash กลับไปใช้ลำดับอัตโนมัติ
        s.run("MATCH (i:LibraryItem) WHERE elementId(i)=$id AND i.cover_hash=$h "
              "REMOVE i.cover_hash", id=eid, h=h)
    return {"ok": True}


@app.post("/api/items/{eid}/photo")
async def add_item_photo(eid: str, files: list[UploadFile] = File(...)):
    hashes = []
    with session() as s:
        chk = s.run("MATCH (i:LibraryItem) WHERE elementId(i)=$id RETURN i",
                    id=eid).single()
        if not chk:
            raise HTTPException(404, "item not found")
        for f in files[:6]:
            raw = await f.read()
            if len(raw) > 8_000_000:
                raise HTTPException(413, "ไฟล์ใหญ่เกิน 8MB")
            h = hashlib.sha256(raw).hexdigest()
            (UPLOADS / f"{h}.jpg").write_bytes(raw)
            s.run("MATCH (i) WHERE elementId(i)=$id "
                  "MERGE (e:Evidence:Image {file_hash:$h}) "
                  "ON CREATE SET e.storage_uri=$u, e.snapshot_at=datetime() "
                  "MERGE (e)-[:DEPICTS]->(i)", id=eid, h=h, u=f"uploads/{h}.jpg")
            hashes.append(h)
    return {"ok": True, "photos": hashes}


@app.get("/api/photo/{h}")
def get_photo(h: str):
    if not re.match(r"^[0-9a-f]{64}$", h):
        raise HTTPException(400, "bad hash")
    f = UPLOADS / f"{h}.jpg"
    if not f.exists():
        raise HTTPException(404, "photo not found")
    return FileResponse(f, media_type="image/jpeg")


def get_ai_config():
    with session() as s:
        rec = s.run("MATCH (c:AppConfig {id:'ai'}) RETURN c").single()
    if not rec:
        env_key = os.environ.get("ANTHROPIC_API_KEY")
        if env_key:
            return {"provider": "anthropic", "model": "claude-sonnet-5",
                    "base_url": None, "api_key": env_key}
        return None
    c = dict(rec["c"])
    base = {"openai": "https://api.openai.com/v1",
            "openrouter": "https://openrouter.ai/api/v1",
            "google": "https://generativelanguage.googleapis.com/v1beta/openai"}
    return {"provider": c["provider"], "model": c.get("model", ""),
            "base_url": c.get("base_url") or base.get(c["provider"]),
            "api_key": sec.decrypt_secret(c.get("api_key_enc", "") or "")}


def _chat_once(cfg, prompt, images=None, max_tokens=1200):
    import time
    if cfg["provider"] == "anthropic":
        import anthropic
        content = [{"type": "image", "source": {"type": "base64",
                    "media_type": m, "data": d}} for m, d in (images or [])]
        content.append({"type": "text", "text": prompt})
        client = anthropic.Anthropic(api_key=cfg["api_key"])
        for attempt in range(3):
            try:
                resp = client.messages.create(
                    model=cfg["model"], max_tokens=max_tokens,
                    messages=[{"role": "user", "content": content}])
                return "".join(b.text for b in resp.content if b.type == "text")
            except anthropic.APIStatusError as e:
                if "credit balance" in str(e).lower():
                    raise HTTPException(402, "เครดิต API หมด — เติมหรือสลับ provider "
                                             "ที่ DAM app แท็บตั้งค่า")
                if getattr(e, "status_code", 0) == 401:
                    raise HTTPException(401, "API key ไม่ถูกต้อง")
                if getattr(e, "status_code", 0) in (502, 503, 504, 529) and attempt < 2:
                    time.sleep(1.5 * (attempt + 1))
                    continue
                raise HTTPException(502, f"provider ไม่พร้อม: {str(e)[:150]}")
            except anthropic.APIConnectionError as e:
                if attempt < 2:
                    time.sleep(1.5 * (attempt + 1))
                    continue
                raise HTTPException(504, f"เชื่อมต่อ provider ไม่ได้: {str(e)[:120]}")
    import httpx
    content = [{"type": "image_url", "image_url": {
        "url": f"data:{m};base64,{d}"}} for m, d in (images or [])]
    content.append({"type": "text", "text": prompt})
    url = f"{cfg['base_url'].rstrip('/')}/chat/completions"
    payload = {"model": cfg["model"], "max_tokens": max_tokens,
               "messages": [{"role": "user", "content": content}]}
    r = None
    for attempt in range(3):
        try:
            r = httpx.post(url, headers={"Authorization": f"Bearer {cfg['api_key']}"},
                           json=payload, timeout=120)
        except httpx.HTTPError as e:
            if attempt == 2:
                raise HTTPException(504, f"เชื่อมต่อ provider ไม่ได้: {str(e)[:120]}")
            time.sleep(1.5 * (attempt + 1))
            continue
        if r.status_code in (502, 503, 504) and attempt < 2:
            time.sleep(1.5 * (attempt + 1))
            continue
        break
    if r.status_code == 401:
        raise HTTPException(401, "API key ไม่ถูกต้อง — แก้ได้ที่ DAM app แท็บตั้งค่า")
    if r.status_code == 402 or "insufficient" in r.text.lower():
        raise HTTPException(402, "เครดิต/โควตา API หมด")
    if r.status_code in (502, 503, 504):
        raise HTTPException(502, f"provider ไม่พร้อม (HTTP {r.status_code}) — "
                                 "ลองใหม่ หรือสลับ provider/ลดจำนวนรูป")
    if r.status_code >= 400:
        raise HTTPException(502, f"Provider error {r.status_code}: {r.text[:150]}")
    try:
        return r.json()["choices"][0]["message"]["content"] or ""
    except (ValueError, KeyError, IndexError):
        raise HTTPException(502, f"provider ตอบผิดรูปแบบ: {r.text[:120]}")


@app.post("/api/vision/extract")
async def vision_extract(files: list[UploadFile] = File(...),
                         media_type: str = Form("auto")):
    cfg = get_ai_config()
    if not (cfg and cfg.get("api_key")):
        raise HTTPException(503, "ยังไม่ได้ตั้งค่า AI provider — ตั้งได้ที่ DAM app แท็บตั้งค่า")
    images, hashes = [], []
    for f in files[:6]:
        raw = await f.read()
        if len(raw) > 8_000_000:
            raise HTTPException(413, "ไฟล์ใหญ่เกิน 8MB")
        h = hashlib.sha256(raw).hexdigest()
        (UPLOADS / f"{h}.jpg").write_bytes(raw)
        hashes.append(h)
        media = f.content_type if f.content_type in (
            "image/jpeg", "image/png", "image/webp") else "image/jpeg"
        images.append((media, base64.b64encode(raw).decode()))
    hint = "" if media_type == "auto" else f"สื่อนี้คือ {media_type} "
    fields = json.dumps({t: [p[0] for p in v["props"]]
                         for t, v in MEDIA_TYPES.items()}, ensure_ascii=False)
    prompt = (
        f"{hint}นี่คือภาพปก/สัน/บาร์โค้ดของสื่อในห้องสมุดส่วนตัว (หนังสือ/แผ่นเสียง/CD/DVD) "
        "อ่านข้อมูลแล้วตอบ JSON เท่านั้น:\n"
        '{"media_type":"Book|VinylRecord|CompactDisc|DVD",\n'
        ' "title":"<ชื่อเรื่อง/อัลบั้ม>", "props":{...}, \n'
        ' "work":{"title":"","creators":[],"publisher":"","first_year":null,'
        f'"genres":["<จาก: {GENRES_HINT} หรืออื่นๆ>"]}},\n'
        ' "confidence":{...}, "notes":""}\n'
        f"ฟิลด์ props ต่อประเภท: {fields}\n"
        "กฎ: ห้ามเดาสิ่งที่ไม่เห็นในภาพ · ฟิลด์ไหนไม่ชัด/ไม่เห็นให้**เว้นว่าง** "
        "ห้ามเขียนประโยคอธิบายหรือคำว่า ambiguous/unknown ลงในค่า · "
        "format ใส่คำเดียว (hardcover/paperback/DVD/Blu-ray) เท่านั้น ไม่ชัดให้เว้น · "
        "ISBN อ่านจากบาร์โค้ดถ้ามี · ตอบ JSON ล้วน")
    text = _chat_once(cfg, prompt, images=images).strip()
    text = re.sub(r"^```(json)?|```$", "", text, flags=re.M).strip()
    try:
        out = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(502, f"model returned non-JSON: {text[:150]}")
    # ทำความสะอาดค่าที่ AI เขียนเป็นประโยค/คำกำกวมลงช่อง (เช่น "ambiguous from image")
    junk = re.compile(r"ambiguous|unknown|ไม่ชัด|not\s+(visible|clear|sure)|n/?a",
                      re.I)
    for k, v in list((out.get("props") or {}).items()):
        if isinstance(v, str) and (junk.search(v) or (k == "format" and len(v) > 20)):
            out["props"].pop(k, None)
    mt = out.get("media_type") if media_type == "auto" else media_type
    if mt not in MEDIA_TYPES:
        mt = ""
    return {"media_type": mt, "title": out.get("title", ""),
            "props": out.get("props", {}), "work": out.get("work", {}),
            "confidence": out.get("confidence", {}), "notes": out.get("notes", ""),
            "photo_hashes": hashes,
            "profile": MEDIA_TYPES.get(mt, {}).get("props", [])}


# --------------------------------------------------------------------------
# Static UI
# --------------------------------------------------------------------------
STATIC = pathlib.Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=STATIC), name="static")


@app.get("/")
def index():
    return FileResponse(STATIC / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8700)

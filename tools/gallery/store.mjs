import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import sharp from 'sharp';
import {hash,metadataFromExif,escapeHtml} from './model.mjs';
const exec=promisify(execFile);
const pipelineVersion='gallery-1/sharp-0.35.5';
const json=async(p,fallback)=>{try{return JSON.parse(await fs.readFile(p,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}};
async function writeJson(p,value){await fs.mkdir(path.dirname(p),{recursive:true});const tmp=p+'.tmp';await fs.writeFile(tmp,JSON.stringify(value,null,2)+'\n');await fs.rename(tmp,p);}
export const readCatalog=root=>json(path.join(root,'src/_data/galleryCatalog.json'),{version:1,photos:[]});
async function lock(root,fn){const dir=path.join(root,'.gallery');await fs.mkdir(dir,{recursive:true});let handle;try{handle=await fs.open(path.join(dir,'lock'),'wx');}catch{throw Error('มีงาน Gallery อีกงานกำลังทำงานอยู่ ตรวจ process ก่อนลบ .gallery/lock');}try{return await fn();}finally{await handle.close();await fs.unlink(path.join(dir,'lock'));}}
async function filesIn(dir,prefix=''){const result=[];for(const e of await fs.readdir(path.join(dir,prefix),{withFileTypes:true})){if(e.isSymbolicLink())continue;const name=path.join(prefix,e.name);if(e.isDirectory())result.push(...await filesIn(dir,name));else if(/\.jpe?g$/i.test(name))result.push(name);}return result.sort();}
export async function importPhotos(root,{source,collection,title}){return lock(root,async()=>{
 if(!/^[a-z0-9][a-z0-9-]{0,63}$/.test(collection||''))throw Error('collection ต้องใช้ตัวอังกฤษเล็ก ตัวเลข หรือ -');
 if(!title?.trim())throw Error('กรุณาระบุชื่อชุดด้วย --title');
 source=await fs.realpath(source);
 // Lightroom Classic Web exports contain thumbnail duplicates; ingest large images only.
 try{const large=path.join(source,'content/images/large');if((await fs.stat(large)).isDirectory())source=large;}catch(e){if(e.code!=='ENOENT')throw e;}
 if(source.startsWith(path.join(root,'.gallery'))||source.startsWith(path.join(root,'src')))throw Error('ใช้โฟลเดอร์ export แยกจากไฟล์เว็บไซต์');
 const names=await filesIn(source);if(!names.length)throw Error('ไม่พบ JPEG ในโฟลเดอร์นี้');
 const registry=await json(path.join(root,'.gallery/registry.json'),{version:1,photos:{}});const results=[];
 for(const name of names){
  const input=path.join(source,name),stat=await fs.stat(input);if(stat.size>30*1024*1024)throw Error(`ไฟล์เกิน 30 MB: ${name}`);
  const bytes=await fs.readFile(input),sourceHash=hash(bytes);
  if(bytes.length>30*1024*1024)throw Error(`ไฟล์เกิน 30 MB: ${name}`);
  // Read tags from the same captured bytes even if Lightroom rewrites the export during import.
  const intake=path.join(root,'.gallery/intake.jpg');await fs.writeFile(intake,bytes);
  let tags;
  try{const {stdout}=await exec('exiftool',['-j','-G1','-s','-charset','filename=UTF8',intake],{maxBuffer:10*1024*1024});tags=JSON.parse(stdout)[0];}
  finally{await fs.unlink(intake);}
  if(tags.Error)throw Error(`อ่าน metadata ไม่สำเร็จ: ${name}`);
  tags.SourceFile=name;
  const metadata=metadataFromExif(tags);
  // Collection + unchanged relative export filename are the declared source key.
  // Same bytes or labels do NOT merge different source records.
  const id='photo-'+hash(collection+'\0'+name).slice(0,24);
  const revision=hash(JSON.stringify({sourceHash,metadata,collectionTitle:title,pipeline:pipelineVersion}));
  const old=registry.photos[id];
  if(old?.revision===revision){results.push({...old,unchanged:true});continue;}
  const dir=path.join(root,'.gallery/items',id,revision);await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,'source.jpg'),bytes);
  await writeJson(path.join(dir,'source-metadata.json'),tags);
  const image=await sharp(bytes,{limitInputPixels:80000000}).rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).jpeg({quality:88}).toFile(path.join(dir,'image.jpg'));
  await sharp(bytes,{limitInputPixels:80000000}).rotate().resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).jpeg({quality:80}).toFile(path.join(dir,'thumb.jpg'));
  const item={id,revision,sourceHash,sourceKey:name,pipelineVersion,collection,collectionTitle:title,metadata,width:image.width,height:image.height,importedAt:new Date().toISOString(),semanticReviewStatus:'unreviewed'};
  await writeJson(path.join(dir,'record.json'),item);registry.photos[id]=item;results.push(item);
 }
 await writeJson(path.join(root,'.gallery/registry.json'),registry);
 await makeReview(root,registry);return results;
});}
async function makeReview(root,registry){
 const catalog=await readCatalog(root);
 const cards=Object.values(registry.photos).map(p=>{const publicPhoto=catalog.photos.find(x=>x.id===p.id);const state=publicPhoto?.revision===p.revision?'เตรียมเผยแพร่แล้ว':publicPhoto?'มีการแก้ไข รอตรวจ':'ภาพใหม่ รอตรวจ';return `<article><img src="items/${p.id}/${p.revision}/thumb.jpg" alt=""><h2>${escapeHtml(p.metadata.title||p.sourceKey)}</h2><p>${state}</p><dl>${Object.entries(p.metadata).map(([k,v])=>`<dt>${k}</dt><dd>${escapeHtml(Array.isArray(v)?v.join(', '):v||'—')}</dd>`).join('')}</dl><p>รหัสภาพ <code>${p.id}</code><br>รุ่น <code>${p.revision}</code></p></article>`;}).join('');
 await fs.writeFile(path.join(root,'.gallery/review.html'),`<!doctype html><html lang="th"><meta charset="utf-8"><meta name="robots" content="noindex"><title>ตรวจภาพก่อนเผยแพร่</title><style>body{font-family:system-ui;background:#f8f7f3;color:#24324b;margin:40px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}article{background:white;padding:24px;overflow-wrap:anywhere}img{width:100%;height:240px;object-fit:contain}dt{font-weight:bold}dd{margin:0 0 12px}</style><h1>ตรวจภาพก่อนเผยแพร่</h1><p>หน้านี้อยู่ในเครื่อง ตรวจภาพ คำบรรยาย ผู้สร้าง ลิขสิทธิ์ คำค้น และวันที่ก่อนเตรียมเผยแพร่ การเผยแพร่ภาพไม่ใช่การอนุมัติความสัมพันธ์ใน Knowledge Graph</p><main>${cards}</main></html>`);
}
export async function approvePhoto(root,{id,revision,reviewer,alt}){return lock(root,async()=>{
 if(!/^photo-[a-f0-9]{24}$/.test(id||'')||!/^[a-f0-9]{64}$/.test(revision||''))throw Error('รหัสหรือ revision ไม่ถูกต้อง');
 if(!reviewer?.trim()||!alt?.trim())throw Error('ต้องระบุ --reviewer และ --alt ที่ตรวจแล้ว');
 const registry=await json(path.join(root,'.gallery/registry.json'),{photos:{}}),p=registry.photos[id];
 if(!p||p.revision!==revision)throw Error('revision เปลี่ยนหรือไม่พบภาพ กรุณาตรวจภาพใหม่');
 if(hash(JSON.stringify({sourceHash:p.sourceHash,metadata:p.metadata,collectionTitle:p.collectionTitle,pipeline:pipelineVersion}))!==revision)throw Error('metadata ของ snapshot เปลี่ยน ต้อง import ใหม่');
 if(!p.metadata.title||!p.metadata.copyright||!p.metadata.creator.length)throw Error('กรุณาใส่ Title, Creator และ Copyright ใน Lightroom แล้ว export/import ใหม่');
 const dest=path.join(root,'src/assets/gallery',id),staged=path.join(root,'.gallery/items',id,revision);
 const source=await fs.readFile(path.join(staged,'source.jpg'));
 if(hash(source)!==p.sourceHash)throw Error('ต้นฉบับ snapshot เปลี่ยน ต้อง import ใหม่');
 // Re-render from verified evidence; never trust a modified preview file for publication.
 await fs.mkdir(dest,{recursive:true});
 const image=await sharp(source,{limitInputPixels:80000000}).rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).jpeg({quality:88}).toBuffer();
 const thumb=await sharp(source,{limitInputPixels:80000000}).rotate().resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).jpeg({quality:80}).toBuffer();
 await fs.writeFile(path.join(dest,revision+'.jpg'),image);await fs.writeFile(path.join(dest,revision+'-thumb.jpg'),thumb);
 await fs.writeFile(path.join(dest,'current.jpg'),image);
 const photo={id,revision,sourceHash:p.sourceHash,collection:p.collection,collectionTitle:p.collectionTitle,metadata:p.metadata,width:p.width,height:p.height,alt:alt.trim(),image:`/assets/gallery/${id}/${revision}.jpg`,thumbnail:`/assets/gallery/${id}/${revision}-thumb.jpg`,publication:{reviewer:reviewer.trim(),at:new Date().toISOString()}};
 const catalog=await readCatalog(root);catalog.photos=catalog.photos.filter(x=>x.id!==id).concat(photo).sort((a,b)=>a.id.localeCompare(b.id));
 await writeJson(path.join(root,'src/_data/galleryCatalog.json'),catalog);await makeReview(root,registry);return photo;
});}

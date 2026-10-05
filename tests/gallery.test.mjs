import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import sharp from 'sharp';
import {importPhotos,approvePhoto,readCatalog} from '../tools/gallery/store.mjs';
import {galleryGraph,metadataFromExif,photoFigure} from '../tools/gallery/model.mjs';
const exec=promisify(execFile);
async function fixture(){const root=await fs.mkdtemp(path.join(os.tmpdir(),'gallery-test-'));const source=path.join(root,'exports');await fs.mkdir(source);return {root,source};}
async function image(file,title='กบไสไม้'){await sharp({create:{width:48,height:32,channels:3,background:'#ba8761'}}).jpeg().toFile(file);await exec('exiftool',['-overwrite_original',`-XMP-dc:Title=${title}`,'-XMP-dc:Description=คำบรรยายจากต้นทาง','-XMP-dc:Creator=Test Author','-XMP-dc:Rights=Test copyright','-XMP-dc:Subject=woodworking','-GPSLatitude=13.7','-GPSLatitudeRef=N','-GPSLongitude=100.5','-GPSLongitudeRef=E','-SerialNumber=PRIVATE-SERIAL',file]);}
const options=source=>({source,collection:'woodworking',title:'เครื่องมืองานไม้'});
test('Thai metadata, XMP priority and unknown dates preserve evidence',()=>{
 const m=metadataFromExif({'XMP-dc:Title':'ชื่อไทย','IPTC:ObjectName':'old','XMP-dc:Subject':['one','two'],'ExifIFD:DateTimeOriginal':'2026:09:28 12:00:00'});
 assert.equal(m.title,'ชื่อไทย');assert.deepEqual(m.keywords,['one','two']);assert.equal(m.capturedAt,'2026:09:28 12:00:00');assert.deepEqual(m.creator,[]);
});
test('Import is private, idempotent, distinct records survive identical bytes; updates require revision review',async()=>{
 const {root,source}=await fixture();try{
 const file=path.join(source,'one.jpg');await image(file);await fs.copyFile(file,path.join(source,'two.jpg'));
 const first=await importPhotos(root,options(source));assert.equal(first.length,2);assert.notEqual(first[0].id,first[1].id);assert.equal(first[0].sourceHash,first[1].sourceHash);
 assert.equal((await readCatalog(root)).photos.length,0);
 const again=await importPhotos(root,options(source));assert.ok(again.every(p=>p.unchanged));
 const one=first.find(p=>p.sourceKey==='one.jpg');
 const published=await approvePhoto(root,{id:one.id,revision:one.revision,reviewer:'Owner test',alt:'ภาพทดสอบกบไสไม้'});
 const tags=JSON.parse((await exec('exiftool',['-j','-G1',path.join(root,'src',published.image)])).stdout)[0];
 assert.ok(!Object.keys(tags).some(k=>/GPS|Serial|Creator|SourceFilePath/.test(k)));
 assert.equal(published.metadata.title,'กบไสไม้');
 const graph=galleryGraph([published]);assert.equal(graph['@graph'].length,2);assert.equal(graph['@graph'][1]['kg:semanticReviewStatus'],'unreviewed');assert.ok(!JSON.stringify(graph).includes('PRIVATE-SERIAL'));assert.ok(!JSON.stringify(graph).includes(source));
 const html=photoFigure(published,'<script>alert(1)</script>');assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
 await exec('exiftool',['-overwrite_original','-XMP-dc:Title=ชื่อแก้ใหม่',file]);
 const updated=(await importPhotos(root,options(source))).find(p=>p.sourceKey==='one.jpg');assert.equal(updated.id,one.id);assert.notEqual(updated.revision,one.revision);
 await assert.rejects(approvePhoto(root,{id:one.id,revision:one.revision,reviewer:'Owner test',alt:'test'}),/revision/);
 assert.equal((await readCatalog(root)).photos[0].revision,one.revision);
 await approvePhoto(root,{id:updated.id,revision:updated.revision,reviewer:'Owner test',alt:'test'});
 assert.ok(await fs.stat(path.join(root,'src',published.image))); // Previous rendition remains addressable.
 await fs.unlink(path.join(source,'two.jpg'));await importPhotos(root,options(source));
 const registry=JSON.parse(await fs.readFile(path.join(root,'.gallery/registry.json')));assert.equal(Object.keys(registry.photos).length,2);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('Web Module import excludes thumbnails; missing metadata cannot be approved silently',async()=>{
 const {root,source}=await fixture();try{
 for(const type of ['large','thumb']){const dir=path.join(source,'content/images',type);await fs.mkdir(dir,{recursive:true});await sharp({create:{width:20,height:20,channels:3,background:'white'}}).jpeg().toFile(path.join(dir,'one.jpg'));}
 const result=await importPhotos(root,options(source));assert.equal(result.length,1);
 await assert.rejects(approvePhoto(root,{id:result[0].id,revision:result[0].revision,reviewer:'Owner test',alt:'test'}),/Title/);
 await assert.rejects(importPhotos(root,{...options(source),collection:'../escape'}));
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('Tampered metadata/source blocks promotion; unknown image references fail',async()=>{
 const {root,source}=await fixture();try{
 await image(path.join(source,'one.jpg'));const [p]=await importPhotos(root,options(source));
 const recordPath=path.join(root,'.gallery/registry.json');const r=JSON.parse(await fs.readFile(recordPath));r.photos[p.id].metadata.title='tampered';await fs.writeFile(recordPath,JSON.stringify(r));
 await assert.rejects(approvePhoto(root,{id:p.id,revision:p.revision,reviewer:'Owner test',alt:'test'}),/metadata/);
 assert.throws(()=>photoFigure(undefined),/not published/);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('Eleventy article, gallery and graph share identity; public build excludes drafts and escapes metadata',async()=>{
 const {root,source}=await fixture();try{
 const original=process.cwd();
 for(const name of ['src','tools','.eleventy.js','package.json'])await fs.cp(path.join(original,name),path.join(root,name),{recursive:true});
 await fs.symlink(path.join(original,'node_modules'),path.join(root,'node_modules'),'dir');
 await fs.writeFile(path.join(root,'src/_data/galleryCatalog.json'),JSON.stringify({version:1,photos:[]}));
 await image(path.join(source,'public.jpg'),'</title><script>bad()</script>');
 await image(path.join(source,'private.jpg'),'private-draft-sentinel');
 const records=await importPhotos(root,options(source)),p=records.find(p=>p.sourceKey==='public.jpg');
 await approvePhoto(root,{id:p.id,revision:p.revision,reviewer:'Owner test',alt:'ทดสอบ'});
 await fs.writeFile(path.join(root,'src/content/gallery-test.md'),`---\nlayout: layouts/article.njk\ntitle: Gallery integration test\ndepartment: bench\nslug: gallery-integration-test\ngallery_image: ${p.id}\n---\n{% galleryImage "${p.id}" %}\n`);
 await exec(process.execPath,[path.join(original,'node_modules/@11ty/eleventy/cmd.cjs')],{cwd:root});
 await exec(process.execPath,['tools/build-graph.js'],{cwd:root});
 const graph=JSON.parse(await fs.readFile(path.join(root,'_site/knowledge-graph.jsonld')));
 const imageNodes=graph['@graph'].filter(n=>n['@type']==='schema:ImageObject');assert.equal(imageNodes.length,1);
 const article=graph['@graph'].find(n=>n['@id']==='https://noppadol.online/gallery-integration-test');assert.equal(article.image[0]['@id'],imageNodes[0]['@id']);
 const detail=await fs.readFile(path.join(root,'_site/gallery',p.id,'index.html'),'utf8');assert.ok(!detail.includes('<script>bad()'));assert.ok(detail.includes('&lt;/title&gt;'));
 const index=await fs.readFile(path.join(root,'_site/gallery/index.html'),'utf8');assert.ok(!index.includes('private-draft-sentinel'));assert.ok(!JSON.stringify(graph).includes('private-draft-sentinel'));
 const privatePhoto=records.find(p=>p.sourceKey==='private.jpg');await assert.rejects(fs.stat(path.join(root,'_site/gallery',privatePhoto.id)));
 }finally{await fs.rm(root,{recursive:true,force:true});}
});

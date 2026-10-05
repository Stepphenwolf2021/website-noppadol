import fs from 'node:fs';
export function loadGallery(){
 const catalog=JSON.parse(fs.readFileSync('src/_data/galleryCatalog.json','utf8'));
 if(process.env.GALLERY_PREVIEW!=='1')return catalog;
 const registry=JSON.parse(fs.readFileSync('.gallery/registry.json','utf8'));
 const photos=new Map(catalog.photos.map(p=>[p.id,p]));
 for(const p of Object.values(registry.photos))photos.set(p.id,{...p,alt:p.metadata.title||'ภาพรอคำอธิบาย',metadata:{...p.metadata,title:p.metadata.title||p.sourceKey},image:`/assets/gallery-preview/${p.id}/${p.revision}.jpg`,thumbnail:`/assets/gallery-preview/${p.id}/${p.revision}-thumb.jpg`});
 return {version:1,preview:true,photos:[...photos.values()]};
}

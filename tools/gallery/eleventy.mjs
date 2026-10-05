import {loadGallery} from './load.mjs';
import {photoFigure,imageNode,galleryGraph} from './model.mjs';
export function configureGallery(config){
 const photos=()=>loadGallery().photos;
 if(process.env.GALLERY_PREVIEW==='1'){
  for(const p of photos()){
   config.addPassthroughCopy({[`.gallery/items/${p.id}/${p.revision}/image.jpg`]:p.image.slice(1)});
   config.addPassthroughCopy({[`.gallery/items/${p.id}/${p.revision}/thumb.jpg`]:p.thumbnail.slice(1)});
  }
 }
 config.addShortcode('galleryImage',(id,alt,caption)=>photoFigure(photos().find(p=>p.id===id),alt,caption));
 config.addFilter('galleryPhoto',id=>{const p=photos().find(p=>p.id===id);if(!p)throw Error(`Unknown or unpublished gallery image: ${id}`);return p;});
 config.addFilter('photoJsonLd',p=>JSON.stringify({'@context':galleryGraph([])['@context'],...imageNode(p)}).replace(/</g,'\\u003c'));
 config.addFilter('galleryJsonLd',g=>JSON.stringify(galleryGraph(g.photos)).replace(/</g,'\\u003c'));
 config.addFilter('galleryCollections',g=>[...new Map(g.photos.map(p=>[p.collection,{id:p.collection,title:p.collectionTitle}])).values()]);
}

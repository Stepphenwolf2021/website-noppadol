import {createHash} from 'node:crypto';
export const BASE='https://noppadol.online';
export const hash=value=>createHash('sha256').update(value).digest('hex');
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const string=value=>typeof value==='string'?value.trim():'';
const list=value=>(Array.isArray(value)?value:[value]).map(string).filter(Boolean);
export function metadataFromExif(tags){
 const pick=(...keys)=>keys.map(k=>tags[k]).find(v=>v!==undefined&&v!=='');
 return {
  title:string(pick('XMP-dc:Title','IPTC:ObjectName')),
  caption:string(pick('XMP-dc:Description','IPTC:Caption-Abstract')),
  creator:list(pick('XMP-dc:Creator','IPTC:By-line','IFD0:Artist')),
  copyright:string(pick('XMP-dc:Rights','IPTC:CopyrightNotice','IFD0:Copyright')),
  keywords:[...new Set(list(pick('XMP-dc:Subject','IPTC:Keywords')))],
  // Preserve original date text; absence of timezone is not permission to invent one.
  capturedAt:string(pick('XMP-exif:DateTimeOriginal','ExifIFD:DateTimeOriginal','XMP-photoshop:DateCreated')),
 };
}
export function imageNode(photo){
 return {'@id':`${BASE}/gallery/${photo.id}/#image`,'@type':'schema:ImageObject',
  'rdfs:label':{'@value':`Photograph ${photo.id}`,'@language':'en'},
  'schema:name':photo.metadata.title,'schema:caption':photo.metadata.caption,
  'schema:contentUrl':{'@id':BASE+photo.image},'schema:thumbnailUrl':{'@id':BASE+photo.thumbnail},
  'schema:url':{'@id':`${BASE}/gallery/${photo.id}/`},
  'schema:width':photo.width,'schema:height':photo.height,
  'dct:creator':photo.metadata.creator,
  'schema:copyrightNotice':photo.metadata.copyright,'schema:keywords':photo.metadata.keywords,
  'kg:sourceDateText':photo.metadata.capturedAt,
  'kg:sourceRevision':photo.revision,'kg:sourceSystem':'Lightroom export',
  'kg:semanticReviewStatus':'unreviewed','kg:publicationStatus':photo.publication?'published':'draft',
  'kg:publicationReviewer':photo.publication?.reviewer,'kg:publicationReviewedAt':photo.publication?.at,
  'prov:wasDerivedFrom':{'@id':`urn:sha256:${photo.sourceHash}`},
  'schema:isPartOf':{'@id':`${BASE}/gallery/#collection-${photo.collection}`}};
}
export const graphContext={dct:'http://purl.org/dc/terms/',schema:'https://schema.org/',rdfs:'http://www.w3.org/2000/01/rdf-schema#',prov:'http://www.w3.org/ns/prov#',kg:BASE+'/ns/gallery#'};
export function galleryGraph(photos){return {'@context':graphContext,'@graph':[
 ...[...new Set(photos.map(p=>p.collection))].map(id=>({'@id':`${BASE}/gallery/#collection-${id}`,'@type':'schema:Collection','schema:name':photos.find(p=>p.collection===id).collectionTitle})),
 ...photos.map(imageNode)]};}
export function photoFigure(photo,alt,caption){
 if(!photo)throw new Error('Gallery image is not published or ID is unknown');
 return `<figure class="gallery-figure"><a href="/gallery/${photo.id}/"><img src="${photo.image}" alt="${escapeHtml(alt||photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy"></a><figcaption>${escapeHtml(caption||photo.metadata.caption||photo.metadata.title)} <a href="/gallery/${photo.id}/">รายละเอียดภาพ</a></figcaption></figure>`;
}

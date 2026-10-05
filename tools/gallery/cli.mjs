import {parseArgs} from 'node:util';
import {fileURLToPath} from 'node:url';
import {importPhotos,approvePhoto} from './store.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
try{
 const {values,positionals}=parseArgs({allowPositionals:true,options:Object.fromEntries(['source','collection','title','id','revision','reviewer','alt'].map(k=>[k,{type:'string'}]))});
 if(positionals[0]==='import'){
  const result=await importPhotos(root,values);console.log(`นำเข้า ${result.length} ภาพ (${result.filter(p=>p.unchanged).length} ภาพไม่เปลี่ยน) ตรวจได้ที่ .gallery/review.html`);
  for(const p of result)console.log(p.id+' '+p.revision);
 }else if(positionals[0]==='approve'){
  const p=await approvePhoto(root,values);console.log(`เตรียมเผยแพร่ ${p.id} แล้ว ยังไม่ได้ส่งขึ้นเว็บ\nใช้ในบทความ: {% galleryImage "${p.id}" %}`);
 }else throw Error('ใช้ import --source PATH --collection SLUG --title TITLE หรือ approve --id ID --revision HASH --reviewer NAME --alt TEXT');
}catch(e){console.error(e.message);process.exitCode=1;}

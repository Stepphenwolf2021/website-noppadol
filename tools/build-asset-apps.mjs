import fs from 'node:fs';
import {domains} from '../asset-studio/domains.js';
const shell=fs.readFileSync('asset-studio/index.html','utf8');
for(const [key,app] of Object.entries(domains)){
 const html=shell.replace('<head>','<head><base href="/asset-studio/">').replace('<body>',`<body data-domain="${key}">`).replace('<title>Asset Studio — Seize the Day</title>',`<title>${app.name} — Seize the Day</title>`);
 fs.mkdirSync(`asset-studio/${key}`,{recursive:true});fs.writeFileSync(`asset-studio/${key}/index.html`,html);
}

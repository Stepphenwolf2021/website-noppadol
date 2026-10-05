import {spawnSync} from 'node:child_process';
const env={...process.env,GALLERY_PREVIEW:'1'};
const build=spawnSync(process.execPath,['node_modules/@11ty/eleventy/cmd.cjs'],{env,stdio:'inherit'});
if(build.status!==0)process.exit(build.status||1);
const graph=spawnSync(process.execPath,['tools/build-graph.js'],{env,stdio:'inherit'});
if(graph.status!==0)process.exit(graph.status||1);
console.log('ตัวอย่างอยู่ใน .gallery/preview-site — เปิดด้วย local HTTP server เท่านั้น');

// Progressive enhancement: links work before JS; line endpoints follow actual layout.
const map=document.querySelector('.universe');
if(map){
 const topics=[...map.querySelectorAll('.topic-orbit')],lines=[...map.querySelectorAll('.connections line')];
 const center=map.querySelector('.portrait');
 function draw(){const box=map.getBoundingClientRect(),c=center.getBoundingClientRect();topics.forEach((topic,i)=>{const r=topic.getBoundingClientRect(),line=lines[i];line.setAttribute('x1',r.left+r.width/2-box.left);line.setAttribute('y1',r.top+r.height/2-box.top);line.setAttribute('x2',c.left+c.width/2-box.left);line.setAttribute('y2',c.top+c.height/2-box.top);});}
 const observer=new ResizeObserver(draw);observer.observe(map);draw();
 topics.forEach((topic,i)=>{const on=()=>lines[i].classList.add('selected'),off=()=>lines[i].classList.remove('selected');topic.addEventListener('pointerenter',on);topic.addEventListener('pointerleave',off);topic.addEventListener('focus',on);topic.addEventListener('blur',off);});
}

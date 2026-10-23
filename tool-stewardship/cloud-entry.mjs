import {destination} from './cloud-destination.mjs?v=1.0.0';
const page=document.body.dataset.cloudPage||'library',url=destination(page,location.search,location.hash);document.querySelector('#open-cloud').href=url;location.replace(url);

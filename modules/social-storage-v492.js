'use strict';
(() => {
  const KEY='sigma.social.engine.v492';
  const collections=['accounts','posts','messages','comments','metrics','notifications','scheduledPosts'];
  const blank=()=>({schemaVersion:2,lastSyncAt:'',updatedAt:new Date().toISOString(),...Object.fromEntries(collections.map(k=>[k,[]]))});
  const parse=v=>{try{return JSON.parse(v);}catch{return null;}};
  const clone=v=>JSON.parse(JSON.stringify(v));
  function load(){const data=parse(localStorage.getItem(KEY))||blank();collections.forEach(k=>{if(!Array.isArray(data[k]))data[k]=[];});return data;}
  function save(data){data.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent('sigma:social-engine-updated',{detail:clone(data)}));return clone(data);}
  function upsertMany(collection,items=[]){if(!collections.includes(collection))throw new Error(`Unknown collection ${collection}`);const data=load();for(const item of items){const index=data[collection].findIndex(old=>old.id===item.id||(item.externalId&&old.externalId===item.externalId&&old.provider===item.provider));if(index>=0)data[collection][index]=item;else data[collection].unshift(item);}return save(data);}
  function removeProvider(provider){const data=load();collections.forEach(k=>data[k]=data[k].filter(x=>x.provider!==provider));return save(data);}
  function markSync(iso=new Date().toISOString()){const data=load();data.lastSyncAt=iso;return save(data);}
  function summary(){const d=load();const pending=d.messages.filter(x=>x.status!=='done').length+d.comments.filter(x=>x.status!=='done').length;const reach=d.metrics.filter(x=>x.name==='reach').reduce((s,x)=>s+Number(x.value||0),0);return{accounts:d.accounts.filter(x=>x.connected!==false).length,posts:d.posts.length,messages:d.messages.length,comments:d.comments.length,notifications:d.notifications.length,pending,reach,lastSyncAt:d.lastSyncAt};}
  window.SigmaSocialStorage=Object.freeze({version:'4.9.2',load:()=>clone(load()),save,upsertMany,removeProvider,markSync,summary,reset:()=>save(blank())});
})();

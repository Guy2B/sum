'use strict';
(() => {
  function update(){const s=window.SigmaSocialEngine?.summary?.()||{};const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v??0);};set('social-kpi-accounts',s.accounts);set('social-kpi-replies',s.pending);set('social-kpi-comments',s.comments);set('social-nav-count',s.pending);const label=document.getElementById('social-mode-label');if(label)label.textContent='ENGINE 4.9.2';}
  function bind(){const sync=document.getElementById('social-sync');if(sync&&!sync.dataset.engine492){sync.dataset.engine492='1';sync.addEventListener('click',async()=>{sync.disabled=true;try{await window.SigmaSocialEngine?.syncAll?.();update();}catch(e){console.error(e);}finally{sync.disabled=false;}});}const diagnostic=document.getElementById('social-v490-diagnostics');if(diagnostic&&!diagnostic.dataset.engine492){diagnostic.dataset.engine492='1';diagnostic.addEventListener('click',()=>window.SigmaSocialDiagnostics?.show?.(),{capture:true});}update();}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();window.addEventListener('sigma:social-engine-updated',update);
})();

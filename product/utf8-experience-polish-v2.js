(function(g){
 const bad=/(?:Ã.|Â.|â€|ï¿½|Î£|ðŸ)/u;
 function set(s,v){const e=document.querySelector(s);if(e)e.textContent=v}
 function polish(){
  const lang=document.getElementById('language-select')?.value||document.documentElement.lang||'fr';
  if(!String(lang).toLowerCase().startsWith('fr'))return;
  set('[data-panel="journal"] [data-i18n="nav.journal"]','Mon parcours');
  set('[data-panel="learning"] #nav-label-learning','Apprentissages');
  set('#panel-journal .page-heading h1','Mon parcours');
  set('#panel-learning .page-heading h1','Mes apprentissages');
 }
 function audit(){
  const problems=[];
  document.querySelectorAll('body *').forEach(e=>{if(!e.children.length&&bad.test(e.textContent||''))problems.push({tag:e.tagName,id:e.id||'',text:(e.textContent||'').slice(0,120)})});
  g.SigmaUTF8Audit={ok:!problems.length,problems,checkedAt:new Date().toISOString()};
  return g.SigmaUTF8Audit;
 }
 function boot(){polish();setTimeout(audit,1000);document.getElementById('language-select')?.addEventListener('change',()=>setTimeout(polish,50))}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
 g.SigmaExperiencePolishV2={polish,audit};
})(window);

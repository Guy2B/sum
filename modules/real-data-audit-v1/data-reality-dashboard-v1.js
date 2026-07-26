(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(){
    const panel=document.getElementById('panel-context')||document.querySelector('[data-panel-root="context"]');
    if(!panel||document.getElementById('sigma-data-reality-dashboard-v1'))return false;
    const host=panel.querySelector('.main-content')||panel;
    const card=document.createElement('article');
    card.id='sigma-data-reality-dashboard-v1';
    card.className='card sigma-data-reality-dashboard-v1';
    host.prepend(card);render();return true;
  }
  function render(){
    const card=document.getElementById('sigma-data-reality-dashboard-v1');if(!card)return;
    const report=window.SigmaRealityScoreEngineV1.all();
    const migration=window.SigmaMigrationPlannerV1.estimate();
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Audit des données réelles</span><h2>Fiabilité et provenance du système</h2><p>Score global : <strong>${report.overall}/100</strong> · ${migration.keys} clé(s) locale(s) à analyser.</p></div><button type="button" class="button secondary compact" data-action="sigma-export-data-audit">Exporter</button></div><div class="sigma-reality-grid">${report.rows.map(x=>`<article><div>${window.SigmaProvenanceLabelsV1.badge(x.origin)}</div><strong>${esc(x.label)}</strong><p>${esc(x.storage)} · synchro ${esc(x.sync)}</p><meter min="0" max="100" value="${x.realityScore}">${x.realityScore}</meter><small>${x.realityScore}/100 · ${esc(x.freshness)}</small></article>`).join('')}</div>`;
    card.querySelector('[data-action="sigma-export-data-audit"]')?.addEventListener('click',()=>window.SigmaDataAuditReportV1.download());
  }
  function boot(){mount();window.SigmaProvenanceLabelsV1.decorate(document);}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1000),{once:true}):setTimeout(boot,1000);
  g.SigmaDataRealityDashboardV1={mount,render,boot};
})(window);

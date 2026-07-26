(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mountJourney(){
    const panel=document.getElementById('panel-journal');if(!panel||document.getElementById('sigma-unified-journey-v4'))return;
    const host=panel.querySelector('.main-content')||panel;
    const card=document.createElement('article');
    card.id='sigma-unified-journey-v4';card.className='card sigma-unified-journey-v4';
    host.prepend(card);renderJourney();
  }
  function renderJourney(){
    const card=document.getElementById('sigma-unified-journey-v4');if(!card)return;
    const rows=window.SigmaJourneyUnifierV4.all().slice(0,12);
    const summary=window.SigmaJourneyUnifierV4.summary();
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Mon parcours unifié</span><h2>Réflexions, apprentissages et étapes importantes</h2><p>${summary.total} élément(s) réunis dans une seule chronologie.</p></div><button class="button secondary compact" type="button" data-panel="context">Voir mon contexte</button></div><div class="sigma-journey-metrics"><span><strong>${summary.journal}</strong> réflexions</span><span><strong>${summary.learning}</strong> apprentissages</span><span><strong>${summary.milestones}</strong> étapes</span></div><div class="sigma-journey-stream">${rows.map(x=>`<article><time>${new Date(x.date).toLocaleDateString()}</time><div><strong>${esc(x.title||x.kind)}</strong><p>${esc(x.text||'')}</p></div><span>${esc(x.kind)}</span></article>`).join('')||'<p class="muted">Votre parcours se construira ici.</p>'}</div>`;
  }
  function mountCoachSources(){
    const panel=document.getElementById('panel-coach');if(!panel||document.getElementById('sigma-coach-sources-v4'))return;
    const host=panel.querySelector('.main-content')||panel;
    const card=document.createElement('article');card.id='sigma-coach-sources-v4';card.className='card sigma-coach-sources-v4';
    const data=window.SigmaCoachContextBridgeV4.snapshot(),recs=window.SigmaCoachContextBridgeV4.recommendations(data);
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Sources du Coach</span><h2>Conseils fondés sur votre système</h2><p>${esc(window.SigmaCoachContextBridgeV4.explainSources(data))}</p></div></div><div class="sigma-coach-recommendations">${recs.map(x=>`<article data-priority="${x.priority}"><strong>${esc(x.title)}</strong><p>${esc(x.reason)}</p></article>`).join('')}</div>`;
    host.prepend(card);
  }
  function boot(){
    window.SigmaNavigationConsolidatorV4.consolidate();
    window.SigmaComponentHarmonizerV4.apply();
    mountJourney();mountCoachSources();
    window.addEventListener('sigma:journey-timeline-updated',renderJourney);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900),{once:true}):setTimeout(boot,900);
  g.SigmaProductConsolidationUIV4={boot,mountJourney,mountCoachSources,renderJourney};
})(window);

(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensure(){
    if(document.getElementById('sigma-command-center'))return;
    const approval=document.getElementById('sigma-approval-center')||document.getElementById('sigma-action-center');
    const card=document.createElement('article');card.id='sigma-command-center';card.className='card sigma-command-center';
    card.innerHTML='<div class="card-heading"><div><span class="eyebrow">Command Center</span><h2>Brief exécutif et état du système</h2></div><button id="sigma-command-refresh" class="button secondary compact" type="button">Tout actualiser</button></div><p id="sigma-command-headline" class="sigma-command-headline">Initialisation…</p><div class="sigma-command-kpis"><span><b data-cc-signals>0</b> signaux</span><span><b data-cc-urgent>0</b> priorités</span><span><b data-cc-actions>0</b> actions</span><span><b data-cc-approvals>0</b> approbations</span><span><b data-cc-completed>0</b> exécutées</span></div><div class="sigma-command-grid"><section><h3>Focus maintenant</h3><div id="sigma-command-focus"></div></section><section><h3>Santé & alertes</h3><div id="sigma-command-health"></div></section></div><details><summary>Chronologie consolidée</summary><div id="sigma-command-timeline"></div></details>';
    approval?.parentNode?.insertBefore(card,approval.nextSibling);
    document.getElementById('sigma-command-refresh')?.addEventListener('click',async e=>{e.currentTarget.disabled=true;try{render(await window.SigmaCommandCenter.refreshAll());}finally{e.currentTarget.disabled=false;}});
  }
  function render(snapshot){
    ensure();
    const set=(s,v)=>{const e=document.querySelector(s);if(e)e.textContent=v};
    set('[data-cc-signals]',snapshot.metrics.signals);set('[data-cc-urgent]',snapshot.metrics.urgent);set('[data-cc-actions]',snapshot.metrics.openActions);set('[data-cc-approvals]',snapshot.metrics.pendingApprovals);set('[data-cc-completed]',snapshot.metrics.completedExecutions);
    const headline=document.getElementById('sigma-command-headline');if(headline)headline.textContent=snapshot.brief.headline;
    const focus=document.getElementById('sigma-command-focus');
    if(focus)focus.innerHTML=(snapshot.today||[]).slice(0,6).map((x,i)=>`<article class="sigma-command-row"><b>${i+1}</b><div><strong>${esc(x.title)}</strong><small>${esc(x.provider)} · score ${x.focusScore}</small></div></article>`).join('')||'<p class="muted">Aucun focus prioritaire.</p>';
    const health=document.getElementById('sigma-command-health');
    if(health)health.innerHTML=snapshot.health.warnings.length?snapshot.health.warnings.map(x=>`<p><strong>${esc(x.level)}</strong> · ${esc(x.message)}</p>`).join(''):'<p>État nominal.</p>';
    const timeline=document.getElementById('sigma-command-timeline');
    if(timeline)timeline.innerHTML=(snapshot.timeline||[]).slice(0,20).map(x=>`<p><strong>${esc(x.type)}</strong> · ${esc(x.title)} · ${new Date(x.at).toLocaleString()}</p>`).join('')||'<p class="muted">Aucun événement consolidé.</p>';
  }
  function boot(){ensure();render(window.SigmaCommandCenter.rebuild());['sigma:unified-feed-updated','sigma:action-center-updated','sigma:approval-queue-updated','sigma:execution-completed'].forEach(evt=>window.addEventListener(evt,()=>render(window.SigmaCommandCenter.rebuild())));}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,650),{once:true}):setTimeout(boot,650);
  g.SigmaCommandCenterUI={render};
})(window);

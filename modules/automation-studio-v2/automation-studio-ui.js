(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensure(){
    if(document.getElementById('sigma-automation-studio'))return;
    const command=document.getElementById('sigma-command-center');
    const card=document.createElement('article');card.id='sigma-automation-studio';card.className='card sigma-automation-studio';
    card.innerHTML='<div class="card-heading"><div><span class="eyebrow">Automation Studio</span><h2>Routines et automatisations</h2></div><div><button id="sigma-automation-run" class="button secondary compact" type="button">Exécuter maintenant</button><button id="sigma-automation-add" class="button secondary compact" type="button">Ajouter un modèle</button></div></div><div class="sigma-automation-kpis"><span><b data-as-enabled>0</b> actives</span><span><b data-as-runs>0</b> exécutions</span><span><b data-as-alerts>0</b> alertes</span></div><div id="sigma-automation-rules"></div><details><summary>Journal des automatisations</summary><div id="sigma-automation-history"></div></details>';
    command?.parentNode?.insertBefore(card,command.nextSibling);
    document.getElementById('sigma-automation-run')?.addEventListener('click',async e=>{e.currentTarget.disabled=true;try{await window.SigmaAutomationEngine.runDue();render();}finally{e.currentTarget.disabled=false;}});
    document.getElementById('sigma-automation-add')?.addEventListener('click',()=>{const tpl=window.SigmaAutomationTemplates.list()[0];const rule=window.SigmaAutomationTemplates.instantiate(tpl.id);window.SigmaAutomationRules.upsert(rule);render();});
  }
  function render(){
    ensure();
    const rules=window.SigmaAutomationRules.list();
    const runs=window.SigmaAutomationRuns.list();
    const alerts=window.SigmaAutomationNotifications.list().filter(x=>!x.read);
    const set=(s,v)=>{const e=document.querySelector(s);if(e)e.textContent=v};
    set('[data-as-enabled]',rules.filter(x=>x.enabled).length);set('[data-as-runs]',runs.length);set('[data-as-alerts]',alerts.length);
    const list=document.getElementById('sigma-automation-rules');
    if(list)list.innerHTML=rules.map(rule=>`<article class="sigma-automation-row"><div><strong>${esc(rule.name)}</strong><small>${esc(rule.trigger?.type)} · prochaine exécution ${esc(window.SigmaAutomationScheduler.nextRun(rule)||'événement')}</small><p>${esc(rule.action?.type)}</p></div><div><button data-as-toggle="${esc(rule.id)}">${rule.enabled?'Désactiver':'Activer'}</button><button data-as-run="${esc(rule.id)}">Lancer</button></div></article>`).join('')||'<p class="muted">Aucune routine.</p>';
    list?.querySelectorAll('[data-as-toggle]').forEach(b=>b.addEventListener('click',()=>{const rule=window.SigmaAutomationRules.list().find(x=>x.id===b.dataset.asToggle);window.SigmaAutomationRules.toggle(rule.id,!rule.enabled);render();}));
    list?.querySelectorAll('[data-as-run]').forEach(b=>b.addEventListener('click',async()=>{const rule=window.SigmaAutomationRules.list().find(x=>x.id===b.dataset.asRun);await window.SigmaAutomationEngine.runRule(rule,{force:true});render();}));
    const history=document.getElementById('sigma-automation-history');
    if(history)history.innerHTML=runs.slice(0,30).map(x=>`<p><strong>${esc(x.status)}</strong> · ${esc(x.ruleId)} · ${new Date(x.at).toLocaleString()}</p>`).join('')||'<p class="muted">Aucune exécution.</p>';
  }
  function boot(){ensure();render();window.addEventListener('sigma:automation-run',render);window.addEventListener('sigma:automation-notification',render);setInterval(()=>window.SigmaAutomationEngine.runDue(),60000);}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,800),{once:true}):setTimeout(boot,800);
  g.SigmaAutomationStudioUI={render};
})(window);

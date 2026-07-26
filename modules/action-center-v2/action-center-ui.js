(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensure(){
    if(document.getElementById('sigma-action-center'))return;
    const feed=document.getElementById('sigma-unified-feed-card');
    const card=document.createElement('article');card.id='sigma-action-center';card.className='card sigma-action-center';
    card.innerHTML='<div class="card-heading"><div><span class="eyebrow">Centre opérationnel</span><h2>Aujourd’hui et prochaines actions</h2></div><button id="sigma-action-refresh" class="button secondary compact" type="button">Recalculer</button></div><div class="sigma-action-kpis"><span><b data-ac-today>0</b> aujourd’hui</span><span><b data-ac-replies>0</b> réponses</span><span><b data-ac-opportunities>0</b> opportunités</span><span><b data-ac-risks>0</b> risques</span></div><div id="sigma-action-list"></div><details><summary>Historique des décisions</summary><div id="sigma-action-history"></div></details>';
    feed?.parentNode?.insertBefore(card,feed.nextSibling);
    document.getElementById('sigma-action-refresh')?.addEventListener('click',()=>render(window.SigmaActionCenter.rebuild()));
  }
  function render(data){
    ensure();
    const set=(s,v)=>{const e=document.querySelector(s);if(e)e.textContent=v};
    set('[data-ac-today]',data.today?.length||0);set('[data-ac-replies]',data.communications?.length||0);set('[data-ac-opportunities]',data.opportunities?.length||0);set('[data-ac-risks]',data.risks?.length||0);
    const list=document.getElementById('sigma-action-list');
    if(list)list.innerHTML=(data.today||[]).map(action=>{
      const suggestions=window.SigmaActionSuggestions.suggest(action);
      return `<article class="sigma-action-row"><div><strong>${esc(action.title)}</strong><small>${esc(window.SigmaActionExplanation.explain(action))}</small><p>${esc(action.summary).slice(0,180)}</p></div><div>${suggestions.actions.slice(0,4).map(x=>`<button type="button" data-ac-id="${esc(action.id)}" data-ac-label="${esc(x.label)}">${esc(x.label)}</button>`).join('')}</div></article>`;
    }).join('')||'<p class="muted">Aucune action prioritaire.</p>';
    list?.querySelectorAll('button[data-ac-id]').forEach(btn=>btn.addEventListener('click',()=>window.SigmaActionCenter.decide(btn.dataset.acId,btn.dataset.acLabel)));
    const history=document.getElementById('sigma-action-history');
    if(history)history.innerHTML=(data.history||[]).slice(0,20).map(x=>`<p><strong>${esc(x.label)}</strong> · ${new Date(x.at).toLocaleString()}</p>`).join('')||'<p class="muted">Aucune décision enregistrée.</p>';
  }
  function boot(){ensure();render(window.SigmaActionCenter.rebuild());window.addEventListener('sigma:unified-feed-updated',()=>render(window.SigmaActionCenter.rebuild()));window.addEventListener('sigma:action-center-updated',e=>render(e.detail));}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,400),{once:true}):setTimeout(boot,400);
  g.SigmaActionCenterUI={render};
})(window);

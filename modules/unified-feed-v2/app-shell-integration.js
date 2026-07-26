(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensure(){
    if(document.getElementById('sigma-unified-feed-card'))return;
    const anchor=document.getElementById('v17-context-graph-summary')?.closest('article')||document.querySelector('#panel-dashboard .card');
    const card=document.createElement('article');card.id='sigma-unified-feed-card';card.className='card sigma-unified-feed-card';
    card.innerHTML='<div class="card-heading"><div><span class="eyebrow">Intelligence feed</span><h2>Informations qui peuvent jouer un rôle</h2></div><button class="button secondary compact" id="sigma-unified-refresh" type="button">Actualiser tout</button></div><div id="sigma-unified-status" class="sigma-unified-status">Jamais synchronisé</div><div class="sigma-unified-kpis"><span><b data-uf-connected>0</b> connectés</span><span><b data-uf-priority>0</b> prioritaires</span><span><b data-uf-reply>0</b> réponses</span><span><b data-uf-opportunity>0</b> opportunités</span></div><div id="sigma-unified-list"></div>';
    anchor?.parentNode?.insertBefore(card,anchor.nextSibling);
    document.getElementById('sigma-unified-refresh')?.addEventListener('click',async e=>{e.currentTarget.disabled=true;document.getElementById('sigma-unified-status').textContent='Synchronisation…';try{await window.SigmaUnifiedFeedOrchestrator.sync();}finally{e.currentTarget.disabled=false;}});
    document.getElementById('v17-plan-refresh')?.addEventListener('click',()=>window.SigmaUnifiedFeedOrchestrator.sync());
  }
  function render(data){
    ensure();const items=data.items||[], priority=items.filter(x=>['high','critical'].includes(x.priority?.level)), replies=items.filter(x=>x.needsReply), opportunities=items.filter(x=>x.opportunities?.length);
    const set=(s,v)=>{const e=document.querySelector(s);if(e)e.textContent=v};set('[data-uf-connected]',data.connected||0);set('[data-uf-priority]',priority.length);set('[data-uf-reply]',replies.length);set('[data-uf-opportunity]',opportunities.length);
    const status=document.getElementById('sigma-unified-status');if(status)status.textContent=data.lastSyncAt?`Dernière synchronisation : ${new Date(data.lastSyncAt).toLocaleString()}${data.errors?.length?` · ${data.errors.length} avertissement(s)`:''}`:'Jamais synchronisé';
    const list=document.getElementById('sigma-unified-list');if(list)list.innerHTML=priority.slice(0,8).map(x=>`<article class="sigma-feed-row"><div><strong>${esc(x.title)}</strong><small>${esc(x.provider)} · ${esc(x.author)} · ${new Date(x.publishedAt).toLocaleString()}</small><p>${esc(x.text).slice(0,180)}</p></div><div><b class="sigma-level ${x.priority.level}">${x.priority.level}</b>${x.opportunities?.map(o=>`<span>${esc(o.label)}</span>`).join('')||''}</div></article>`).join('')||'<p class="muted">Aucune information prioritaire détectée.</p>';
    const source=document.getElementById('v17-source-count');if(source)source.textContent=`${data.connected||0} sources actives`;
    const graph=document.getElementById('v17-context-graph-summary');if(graph)graph.textContent=`${items.length} signaux · ${items.reduce((n,x)=>n+(x.entities?.length||0),0)} relations`;
  }
  function boot(){ensure();render(window.SigmaUnifiedFeedStore.load());window.addEventListener('sigma:unified-feed-updated',e=>render(e.detail));}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300),{once:true}):setTimeout(boot,300);
  g.SigmaUnifiedFeedUI={render};
})(window);

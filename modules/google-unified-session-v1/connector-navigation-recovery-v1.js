(function(g){
  const labels={connected:'Connecté','authorization-required':'Autorisation requise',unavailable:'Indisponible',error:'Erreur'};
  function host(){
    return document.getElementById('panel-context')||
      document.querySelector('[data-panel-root="context"]')||
      document.querySelector('main')||document.body;
  }
  function render(){
    let card=document.getElementById('sigma-connector-center-v1');
    if(!card){
      card=document.createElement('article');
      card.id='sigma-connector-center-v1';
      card.className='card sigma-connector-center-v1';
      host().appendChild(card);
    }
    const rows=window.SigmaConnectorRegistryV1.read();
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Réseaux et connecteurs</span><h2>Centre des connexions</h2><p>Les connecteurs restent visibles même lorsqu’une autorisation ou un module manque.</p></div><button class="button secondary compact" data-connector-action="refresh">Actualiser</button></div><div class="sigma-connector-list">${rows.map(x=>`<article data-connector-id="${x.id}"><div><strong>${x.label}</strong><small>${x.group==='google'?'Compte Google unifié':'Connecteur indépendant'}</small></div><span data-status="${x.status}">${labels[x.status]||x.status}</span><button class="button secondary compact" data-connect="${x.id}">${x.status==='connected'?'Recharger':'Activer'}</button></article>`).join('')}</div>`;
    card.querySelector('[data-connector-action="refresh"]').onclick=async()=>{window.SigmaConnectorInventoryV1.scan();await window.SigmaGoogleConnectorAutoloadV1.silentStart();render();};
    card.querySelectorAll('[data-connect]').forEach(btn=>btn.onclick=async()=>{
      const id=btn.dataset.connect;
      if(id.startsWith('google-'))window.SigmaGoogleConsentOnboardingV1.open();
    });
    return card;
  }
  function boot(){window.SigmaLegacyConnectorMigrationV1.migrate();window.SigmaConnectorInventoryV1.scan();render();}
  window.addEventListener('sigma:connector-registry-updated',()=>setTimeout(render,20));
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1400),{once:true}):setTimeout(boot,1400);
  g.SigmaConnectorNavigationRecoveryV1={host,render,boot};
})(window);

(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function host(){
    const panel=document.getElementById('panel-context')||document.querySelector('[data-panel-root="context"]');
    return panel?.querySelector('.main-content')||panel||null;
  }
  function mount(){
    const h=host();if(!h||document.getElementById('sigma-compact-context-profiles-v1'))return false;
    const card=document.createElement('article');
    card.id='sigma-compact-context-profiles-v1';
    card.className='card sigma-compact-context-profiles-v1';
    h.prepend(card);render();return true;
  }
  function render(){
    const card=document.getElementById('sigma-compact-context-profiles-v1');if(!card)return;
    const data=window.SigmaActiveProfileStoreV1.detailed();
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Votre contexte actif</span><h2>Profils et accompagnements</h2><p>Vue réduite des domaines qui personnalisent Sigma.</p></div><button type="button" class="button secondary compact" data-context-profile-action="edit">Modifier</button></div><div class="sigma-context-profile-groups"><section><h3>Profils de vie</h3><div>${data.lifeProfiles.map(x=>`<span class="sigma-context-chip">${esc(x.label)}</span>`).join('')||'<span class="muted">Aucun profil actif</span>'}</div></section><section><h3>Accompagnements</h3><div>${data.supportProfiles.map(x=>`<span class="sigma-context-chip">${esc(x.label)}</span>`).join('')||'<span class="muted">Aucun accompagnement actif</span>'}</div></section></div>`;
    card.querySelector('[data-context-profile-action="edit"]')?.addEventListener('click',()=>window.SigmaOnboardingUIV1.open());
  }
  function boot(){window.SigmaExistingProfileMigrationV1.migrate();mount();}
  window.addEventListener('sigma:active-life-support-updated',render);
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1000),{once:true}):setTimeout(boot,1000);
  g.SigmaCompactContextProfilesV1={host,mount,render,boot};
})(window);

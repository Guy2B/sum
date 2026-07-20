'use strict';
(() => {
  const providerMeta = {
    meta: { icon:'◎', name:'Facebook + Instagram', phase:'V4.9.1 · OAuth sécurisé' },
    linkedin: { icon:'in', name:'LinkedIn', phase:'V4.9.2' },
    youtube: { icon:'▶', name:'YouTube', phase:'V4.9.3' },
    tiktok: { icon:'♪', name:'TikTok', phase:'V4.9.3' },
    x: { icon:'X', name:'X', phase:'V4.9.3' }
  };
  function config(){ return window.SIGMA_SOCIAL_CONFIG || {providers:{}}; }
  function stateFor(key){
    const item=config().providers?.[key] || {};
    if (!item.enabled) return ['disabled','Désactivé'];
    if (item.configured) return ['ready','Prêt'];
    return ['setup','Configuration requise'];
  }
  function card(key){
    const p=providerMeta[key], [status,label]=stateFor(key);
    return `<article class="social-v490-provider" data-provider="${key}"><span class="social-v490-icon">${p.icon}</span><div><strong>${p.name}</strong><small>${p.phase} · ${label}</small></div><span class="social-v490-status ${status}">${status==='ready'?'✓':'•'}</span></article>`;
  }
  function render(){
    const panel=document.querySelector('[data-panel-content="social"], #panel-social, [data-panel="social"].panel');
    const anchor=document.querySelector('.social-kpis');
    if (!anchor || document.getElementById('social-v490-foundation')) return;
    const section=document.createElement('section');
    section.id='social-v490-foundation'; section.className='card social-v490-foundation';
    section.innerHTML=`<div class="social-v490-head"><div><span class="eyebrow">V4.9.0 · Socle social</span><h2>Centre social unifié</h2><p>Un modèle commun pour les comptes, publications, messages, commentaires, métriques et notifications.</p></div><button class="button secondary small" id="social-v490-diagnostics" type="button">Diagnostic</button></div><div class="social-v490-grid">${Object.keys(providerMeta).map(card).join('')}</div><div class="social-v490-model"><span>SocialAccount</span><span>SocialPost</span><span>SocialMessage</span><span>SocialComment</span><span>SocialMetric</span><span>SocialNotification</span></div>`;
    anchor.insertAdjacentElement('afterend',section);
    section.querySelector('#social-v490-diagnostics').addEventListener('click',()=>{
      const core=Boolean(window.SigmaSocialCore), cfg=Boolean(window.SIGMA_SOCIAL_CONFIG), api=String(window.SIGMA_SOCIAL_CONFIG?.connectorBaseUrl||'');
      alert(`Sigma Social V4.9.1\n\nModèle unifié: ${core?'OK':'ERREUR'}\nConfiguration: ${cfg?'OK':'ERREUR'}\nBackend social: ${api?'configuré':'non configuré'}\n\nMeta: connexion, comptes, publications et commentaires.
La publication automatique reste désactivée jusqu'à V4.9.4.`);
    });
  }
  document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',render,{once:true}) : render();
})();

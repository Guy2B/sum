(function(g){
  function host(){return document.getElementById('sigma-compact-context-profiles-v1');}
  function render(state){
    const card=host();if(!card)return;
    let badge=card.querySelector('.sigma-cloud-profile-status');
    if(!badge){
      badge=document.createElement('span');
      badge.className='sigma-cloud-profile-status';
      card.querySelector('.card-heading>div')?.appendChild(badge);
    }
    const ready=window.SigmaFirebaseRuntimeAdapterV1.ready();
    badge.textContent=state|| (ready?'Synchronisation Firebase active':'Profil local uniquement');
    badge.dataset.state=ready?'cloud':'local';
  }
  function boot(){
    render();
    window.addEventListener('sigma:profile-cloud-pushed',()=>render('Synchronisé avec Firebase'));
    window.addEventListener('sigma:profile-cloud-pulled',()=>render('Chargé depuis Firebase'));
    window.addEventListener('sigma:account-first-sync-completed',()=>render('Profil disponible sur vos appareils'));
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1500),{once:true}):setTimeout(boot,1500);
  g.SigmaCrossDeviceIndicatorV1={host,render,boot};
})(window);

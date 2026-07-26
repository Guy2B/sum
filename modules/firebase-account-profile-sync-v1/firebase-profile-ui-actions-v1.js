(function(g){
  function enhance(){
    const card=document.getElementById('sigma-compact-context-profiles-v1');
    if(!card||card.querySelector('[data-profile-cloud-action]'))return false;
    const actions=card.querySelector('.card-heading')?.lastElementChild?.parentElement===card.querySelector('.card-heading')
      ?card.querySelector('.card-heading')
      :card.querySelector('.card-heading');
    const wrap=document.createElement('div');
    wrap.className='sigma-profile-cloud-actions';
    wrap.innerHTML='<button type="button" class="button secondary compact" data-profile-cloud-action="sync">Synchroniser</button><button type="button" class="button secondary compact" data-profile-cloud-action="export">Exporter</button>';
    card.querySelector('.card-heading')?.appendChild(wrap);
    wrap.querySelector('[data-profile-cloud-action="sync"]').addEventListener('click',async()=>{
      try{
        await window.SigmaAccountFirstSyncV1.run();
        await window.SigmaProfileCloudSyncV1.push();
        window.SigmaCrossDeviceIndicatorV1.render('Synchronisé avec Firebase');
      }catch(e){alert(`Synchronisation impossible : ${e.message||e}`);}
    });
    wrap.querySelector('[data-profile-cloud-action="export"]').addEventListener('click',()=>window.SigmaAccountDataExportV1.download());
    return true;
  }
  function boot(){enhance();}
  window.addEventListener('sigma:active-life-support-updated',()=>setTimeout(enhance,50));
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1700),{once:true}):setTimeout(boot,1700);
  g.SigmaFirebaseProfileUIActionsV1={enhance,boot};
})(window);

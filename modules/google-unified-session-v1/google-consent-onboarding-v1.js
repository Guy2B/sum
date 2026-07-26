(function(g){
  const KEY='sigma:google-consent-onboarding:v1';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return{};}}
  function save(patch){const next={...read(),...patch,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(next));return next;}
  function shouldOffer(){
    const identity=window.SigmaGoogleAccountBridgeV1.identity();
    return identity.authenticated&&identity.google&&!read().completedAt;
  }
  function open(){
    const identity=window.SigmaGoogleAccountBridgeV1.identity();
    if(!identity.authenticated||!identity.google)return false;
    let dialog=document.getElementById('sigma-google-consent-onboarding-v1');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='sigma-google-consent-onboarding-v1';dialog.className='sigma-google-consent-onboarding-v1';document.body.appendChild(dialog);}
    const rows=window.SigmaConnectorRegistryV1.list('google');
    dialog.innerHTML=`<form method="dialog"><header><span class="eyebrow">Compte Google détecté</span><h2>Activer vos services Google</h2><p>${identity.email||''}</p></header><section class="sigma-google-consent-grid">${rows.map(x=>`<label><input type="checkbox" name="sigma-google-connector" value="${x.id}" ${x.id==='google-gmail'||x.id==='google-calendar'?'checked':''}><span><strong>${x.label}</strong><small>${x.installed===false?'Module non installé':'Disponible avec autorisation Google'}</small></span></label>`).join('')}</section><footer><button type="button" class="button secondary" data-google-consent="later">Plus tard</button><button type="button" class="button primary" data-google-consent="authorize">Autoriser et charger</button></footer></form>`;
    dialog.querySelector('[data-google-consent="later"]').onclick=()=>{save({deferredAt:new Date().toISOString()});dialog.close();};
    dialog.querySelector('[data-google-consent="authorize"]').onclick=async()=>{
      const ids=[...dialog.querySelectorAll('input[name="sigma-google-connector"]:checked')].map(x=>x.value);
      const scopes=window.SigmaGoogleScopeCatalogV1.forConnectors(ids);
      try{
        await window.SigmaGoogleUnifiedOAuthV1.request(scopes,{prompt:'consent'});
        save({completedAt:new Date().toISOString(),selectedConnectors:ids});
        for(const id of ids)window.SigmaConnectorRegistryV1.setStatus(id,'connected',{authorized:true});
        dialog.close();
        await window.SigmaGoogleConnectorAutoloadV1.loadAll();
      }catch(e){
        for(const id of ids)window.SigmaConnectorRegistryV1.setStatus(id,'error',{error:String(e.message||e)});
      }
    };
    dialog.showModal?.();
    return true;
  }
  function bind(){
    window.addEventListener('sigma:auth-success',()=>setTimeout(()=>shouldOffer()&&open(),700));
    window.addEventListener('firebase:auth-changed',e=>{if(e.detail?.user)setTimeout(()=>shouldOffer()&&open(),700);});
    setTimeout(()=>shouldOffer()&&open(),1800);
  }
  g.SigmaGoogleConsentOnboardingV1={KEY,read,save,shouldOffer,open,bind};
})(window);

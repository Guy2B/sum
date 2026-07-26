(function(g){
  const DOC='connectors';
  async function push(){
    if(!window.SigmaFirebaseRuntimeAdapterV1?.ready?.())return{ok:false,reason:'firebase-not-ready'};
    const payload={items:window.SigmaConnectorRegistryV1.read(),googleConsent:window.SigmaGoogleConsentOnboardingV1.read(),updatedAt:new Date().toISOString(),schemaVersion:1};
    await window.SigmaFirebaseAccountStoreV1.setSubdocument('integrationState',DOC,payload,{merge:true});
    return{ok:true,payload};
  }
  async function pull(){
    if(!window.SigmaFirebaseRuntimeAdapterV1?.ready?.())return{ok:false,reason:'firebase-not-ready'};
    const remote=await window.SigmaFirebaseAccountStoreV1.getSubdocument('integrationState',DOC);
    if(!remote)return{ok:false,reason:'remote-empty'};
    if(Array.isArray(remote.items))window.SigmaConnectorRegistryV1.write(remote.items);
    if(remote.googleConsent)window.SigmaGoogleConsentOnboardingV1.save(remote.googleConsent);
    return{ok:true,remote};
  }
  function bind(){
    let timer=null;
    window.addEventListener('sigma:connector-registry-updated',()=>{clearTimeout(timer);timer=setTimeout(()=>push().catch(()=>{}),900);});
  }
  g.SigmaConnectorFirestoreSyncV1={DOC,push,pull,bind};
})(window);

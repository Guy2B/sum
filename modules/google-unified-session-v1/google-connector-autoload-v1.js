(function(g){
  async function invoke(id){
    const map={
      'google-gmail':()=>window.SigmaGmailSyncV1?.sync?.()||window.SigmaGmailClientV1?.listMessages?.(),
      'google-calendar':()=>window.SigmaGoogleCalendarSyncV1?.sync?.()||window.SigmaGoogleCalendarClientV1?.listEvents?.(),
      'google-drive':()=>window.SigmaGoogleDriveSyncV1?.sync?.()||window.SigmaGoogleDriveClientV1?.listFiles?.(),
      'google-contacts':()=>window.SigmaGoogleContactsSyncV1?.sync?.()||window.SigmaGoogleContactsClientV1?.listContacts?.(),
      'google-tasks':()=>window.SigmaGoogleTasksSyncV1?.sync?.()||window.SigmaGoogleTasksClientV1?.listTasks?.()
    };
    const fn=map[id];
    if(!fn)return{ok:false,reason:'unsupported'};
    try{
      const value=await fn();
      window.SigmaConnectorRegistryV1.setStatus(id,'connected',{loadedAt:new Date().toISOString(),error:null});
      return{ok:true,value};
    }catch(e){
      const message=String(e.message||e);
      const status=/401|403|token|auth|permission/i.test(message)?'authorization-required':'error';
      window.SigmaConnectorRegistryV1.setStatus(id,status,{error:message});
      return{ok:false,error:message};
    }
  }
  async function loadAll(){
    const consent=window.SigmaGoogleConsentOnboardingV1.read();
    const ids=consent.selectedConnectors||window.SigmaConnectorRegistryV1.list('google').filter(x=>x.authorized).map(x=>x.id);
    const results=[];
    for(const id of ids)results.push({id,...await invoke(id)});
    return results;
  }
  async function silentStart(){
    const identity=window.SigmaGoogleAccountBridgeV1.identity();
    if(!identity.authenticated||!identity.google)return{ok:false,reason:'not-google-authenticated'};
    const consent=window.SigmaGoogleConsentOnboardingV1.read();
    if(!consent.completedAt)return{ok:false,reason:'consent-not-completed'};
    if(window.SigmaGoogleUnifiedOAuthV1.hasValidToken())return{ok:true,results:await loadAll()};
    try{
      const scopes=window.SigmaGoogleScopeCatalogV1.forConnectors(consent.selectedConnectors||[]);
      await window.SigmaGoogleUnifiedOAuthV1.request(scopes,{prompt:''});
      return{ok:true,results:await loadAll()};
    }catch(e){
      for(const id of consent.selectedConnectors||[])window.SigmaConnectorRegistryV1.setStatus(id,'authorization-required',{error:null});
      return{ok:false,reason:'interaction-required',error:String(e.message||e)};
    }
  }
  g.SigmaGoogleConnectorAutoloadV1={invoke,loadAll,silentStart};
})(window);

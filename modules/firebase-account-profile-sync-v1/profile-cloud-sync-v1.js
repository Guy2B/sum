(function(g){
  const DOC='active';
  let running=false,lastError=null;
  async function push(){
    if(running)throw new Error('Profile sync already running');
    running=true;lastError=null;
    try{
      const active=window.SigmaActiveProfileStoreV1.read();
      const onboarding=window.SigmaOnboardingStateV1.read();
      const payload={...active,onboardingStatus:onboarding.status,onboardingCompletedAt:onboarding.completedAt||null,schemaVersion:1,syncedAt:new Date().toISOString()};
      await window.SigmaFirebaseAccountStoreV1.setSubdocument('profileState',DOC,payload,{merge:true});
      window.dispatchEvent(new CustomEvent('sigma:profile-cloud-pushed',{detail:payload}));
      return payload;
    }catch(e){lastError=e;throw e;}
    finally{running=false;}
  }
  async function pull(){
    if(running)throw new Error('Profile sync already running');
    running=true;lastError=null;
    try{
      const remote=await window.SigmaFirebaseAccountStoreV1.getSubdocument('profileState',DOC);
      if(!remote)return{applied:false,reason:'remote-empty'};
      window.SigmaActiveProfileStoreV1.replace(remote.lifeProfiles||[],remote.supportProfiles||[]);
      if(remote.onboardingStatus==='completed')window.SigmaOnboardingStateV1.write({status:'completed',step:'done',completedAt:remote.onboardingCompletedAt||remote.syncedAt||null});
      window.dispatchEvent(new CustomEvent('sigma:profile-cloud-pulled',{detail:remote}));
      return{applied:true,remote};
    }catch(e){lastError=e;throw e;}
    finally{running=false;}
  }
  function status(){return{running,lastError:lastError?String(lastError.message||lastError):null};}
  g.SigmaProfileCloudSyncV1={push,pull,status};
})(window);

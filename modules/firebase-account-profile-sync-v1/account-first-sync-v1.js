(function(g){
  let completed=false;
  async function run(){
    if(completed)return{ok:true,skipped:true};
    if(!window.SigmaFirebaseRuntimeAdapterV1.ready())return{ok:false,reason:'firebase-not-ready'};
    await window.SigmaAccountBootstrapV1.ensure();
    const remote=await window.SigmaFirebaseAccountStoreV1.getSubdocument('profileState','active');
    const local=window.SigmaActiveProfileStoreV1.read();
    const decision=window.SigmaProfileConflictResolverV1.resolve(local,remote);
    if(decision.winner==='remote'){
      window.SigmaActiveProfileStoreV1.replace(decision.value.lifeProfiles||[],decision.value.supportProfiles||[]);
    }else{
      await window.SigmaProfileCloudSyncV1.push();
    }
    completed=true;
    window.dispatchEvent(new CustomEvent('sigma:account-first-sync-completed',{detail:decision}));
    return{ok:true,decision};
  }
  function reset(){completed=false;}
  g.SigmaAccountFirstSyncV1={run,reset};
})(window);

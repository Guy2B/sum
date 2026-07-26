(function(g){
  async function run(){
    const user=window.SigmaFirebaseRuntimeAdapterV1.currentUser();
    let remote=null,error=null;
    if(window.SigmaFirebaseRuntimeAdapterV1.ready()){
      try{remote=await window.SigmaFirebaseAccountStoreV1.getSubdocument('profileState','active');}
      catch(e){error=String(e.message||e);}
    }
    return{
      ok:Boolean(user&&window.SigmaFirebaseRuntimeAdapterV1.mode()!=='none'&&!error),
      release:704,
      mode:window.SigmaFirebaseRuntimeAdapterV1.mode(),
      authenticated:Boolean(user),
      uid:user?.uid||null,
      local:window.SigmaActiveProfileStoreV1.read(),
      remote,
      autoSync:window.SigmaProfileAutoSyncV1.status(),
      error,
      checkedAt:new Date().toISOString()
    };
  }
  g.SigmaFirebaseProfileDiagnosticsV1={run};
})(window);

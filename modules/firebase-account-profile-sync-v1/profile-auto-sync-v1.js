(function(g){
  let timer=null,pending=false;
  function schedule(){
    pending=true;
    clearTimeout(timer);
    timer=setTimeout(async()=>{
      pending=false;
      if(!window.SigmaFirebaseRuntimeAdapterV1.ready())return;
      try{await window.SigmaProfileCloudSyncV1.push();}
      catch(e){console.warn('[Sigma] profile auto-sync failed',e);}
    },900);
  }
  function bind(){
    window.addEventListener('sigma:active-life-support-updated',schedule);
    window.addEventListener('sigma:onboarding-state-updated',schedule);
    window.addEventListener('sigma:auth-success',()=>setTimeout(()=>window.SigmaAccountFirstSyncV1.run(),500));
    window.addEventListener('firebase:auth-changed',e=>{if(e.detail?.user)setTimeout(()=>window.SigmaAccountFirstSyncV1.run(),500);});
    setTimeout(()=>window.SigmaAccountFirstSyncV1.run(),1800);
  }
  function status(){return{pending,scheduled:Boolean(timer)};}
  g.SigmaProfileAutoSyncV1={schedule,bind,status};
})(window);

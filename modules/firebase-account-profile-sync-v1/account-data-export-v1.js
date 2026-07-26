(function(g){
  async function build(){
    const user=window.SigmaFirebaseRuntimeAdapterV1.currentUser();
    const cloud=window.SigmaFirebaseRuntimeAdapterV1.ready()?await window.SigmaFirebaseAccountStoreV1.getSubdocument('profileState','active').catch(()=>null):null;
    return{
      release:704,
      generatedAt:new Date().toISOString(),
      account:user?{uid:user.uid,email:user.email||null,displayName:user.displayName||null}:null,
      localProfiles:window.SigmaActiveProfileStoreV1.read(),
      onboarding:window.SigmaOnboardingStateV1.read(),
      cloudProfiles:cloud
    };
  }
  async function download(){
    const data=await build();
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`sigma-account-profile-export-${Date.now()}.json`;
    a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  g.SigmaAccountDataExportV1={build,download};
})(window);

(function(g){
  function profileFromUser(user){
    return{
      uid:user.uid,
      email:user.email||null,
      displayName:user.displayName||null,
      photoURL:user.photoURL||null,
      emailVerified:Boolean(user.emailVerified),
      providerIds:(user.providerData||[]).map(x=>x.providerId).filter(Boolean),
      createdAt:user.metadata?.creationTime||null,
      lastLoginAt:user.metadata?.lastSignInTime||null,
      updatedAt:new Date().toISOString(),
      schemaVersion:1
    };
  }
  async function ensure(){
    const user=window.SigmaFirebaseRuntimeAdapterV1.currentUser();
    if(!user)throw new Error('No authenticated user');
    const data=profileFromUser(user);
    await window.SigmaFirebaseAccountStoreV1.setUser(data,{merge:true});
    window.dispatchEvent(new CustomEvent('sigma:account-bootstrap-completed',{detail:{uid:user.uid}}));
    return data;
  }
  g.SigmaAccountBootstrapV1={profileFromUser,ensure};
})(window);

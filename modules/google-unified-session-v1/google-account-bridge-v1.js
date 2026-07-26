(function(g){
  function firebaseUser(){
    return window.SigmaFirebaseRuntimeAdapterV1?.currentUser?.()||
      window.firebase?.auth?.()?.currentUser||
      window.SigmaAuth?.currentUser?.()||window.SigmaAuth?.user||null;
  }
  function googleProvider(user=firebaseUser()){
    return (user?.providerData||[]).find(x=>x.providerId==='google.com')||null;
  }
  function identity(){
    const user=firebaseUser();
    const provider=googleProvider(user);
    return{
      authenticated:Boolean(user),
      google:Boolean(provider||user?.providerId==='google.com'),
      uid:user?.uid||null,
      email:provider?.email||user?.email||null,
      displayName:provider?.displayName||user?.displayName||null,
      photoURL:provider?.photoURL||user?.photoURL||null
    };
  }
  g.SigmaGoogleAccountBridgeV1={firebaseUser,googleProvider,identity};
})(window);

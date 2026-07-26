(function(g){
  const state={permissionErrors:[],translationErrors:[],release:719};

  function recordPermissionError(error, context='unknown'){
    const item={
      context,
      code:error?.code||null,
      message:String(error?.message||error||'Unknown Firebase error'),
      at:new Date().toISOString()
    };
    state.permissionErrors.push(item);
    window.dispatchEvent(new CustomEvent('sigma:firebase-permission-error',{detail:item}));
    return item;
  }

  function recordTranslationError(key, fallback){
    const item={key:key??null,fallback:fallback??null,at:new Date().toISOString()};
    state.translationErrors.push(item);
    return item;
  }

  function installUnhandledRejectionGuard(){
    window.addEventListener('unhandledrejection',event=>{
      const reason=event.reason;
      const code=reason?.code||'';
      const message=String(reason?.message||reason||'');
      if(code==='permission-denied'||/missing or insufficient permissions/i.test(message)){
        recordPermissionError(reason,'unhandledrejection');
        event.preventDefault();
        console.error('[Sigma] Firestore permission denied. Run SigmaRuntimeFirestoreHotfixV1.diagnostics().',reason);
      }
    });
  }

  function diagnostics(){
    const user =
  window.SigmaCloud?.auth?.currentUser ||
  window.SigmaCloud?.user ||
  window.SigmaFirebaseRuntimeAdapterV1?.currentUser?.() ||
  window.firebase?.auth?.()?.currentUser ||
  null;
    return{
      ok:state.permissionErrors.length===0,
      release:719,
      authenticated:Boolean(user),
      uid:user?.uid||null,
      permissionErrors:[...state.permissionErrors],
      translationErrors:[...state.translationErrors],
      acceptance:window.SigmaRuntimeFirestoreHotfixAcceptanceV1?.validate?.()||null,
      checkedAt:new Date().toISOString()
    };
  }

  installUnhandledRejectionGuard();
  g.SigmaRuntimeFirestoreHotfixV1={state,recordPermissionError,recordTranslationError,diagnostics};
})(window);

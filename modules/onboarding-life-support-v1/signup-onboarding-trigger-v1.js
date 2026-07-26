(function(g){
  let triggered=false;
  function authenticated(){
    const firebaseUser=window.firebase?.auth?.()?.currentUser;
    const modularUser=window.SigmaAuth?.currentUser?.()||window.SigmaAuth?.user||null;
    const bodySignal=document.body?.dataset?.authenticated==='true';
    return Boolean(firebaseUser||modularUser||bodySignal);
  }
  function trigger(reason='manual'){
    if(triggered||!window.SigmaOnboardingStateV1.shouldRun())return false;
    triggered=true;
    window.dispatchEvent(new CustomEvent('sigma:open-life-support-onboarding',{detail:{reason}}));
    return true;
  }
  function check(){
    window.SigmaExistingProfileMigrationV1?.migrate?.();
    if(authenticated())trigger('authenticated');
  }
  function bind(){
    window.addEventListener('sigma:auth-success',()=>trigger('sigma-auth-success'));
    window.addEventListener('firebase:auth-changed',event=>{if(event.detail?.user)trigger('firebase-auth-changed');});
    setTimeout(check,1300);
  }
  g.SigmaSignupOnboardingTriggerV1={authenticated,trigger,check,bind};
})(window);

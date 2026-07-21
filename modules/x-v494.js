'use strict';
(() => {
  const providerConfig=()=>window.SIGMA_SOCIAL_CONFIG?.providers?.x||{};
  const SOCIAL_HASH='#social';
  const X_HOME='https://x.com/home';
  let api,instance,booting=false;

  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  async function waitForSigmaAuth(timeoutMs=15000){
    const started=Date.now();
    while(Date.now()-started<timeoutMs){
      if(window.SigmaCloud?.configured&&window.SigmaCloud?.auth?.currentUser)return window.SigmaCloud.auth.currentUser;
      await sleep(250);
    }
    throw new Error('La session Sigma n’est pas encore prête. Rechargez la page puis réessayez.');
  }

  async function functions(){
    if(api&&instance)return{api,instance};
    await waitForSigmaAuth();
    api=await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js');
    instance=api.getFunctions(
      window.SigmaCloud.auth.app,
      window.SIGMA_SOCIAL_CONFIG?.firebaseFunctionsRegion||'europe-west1'
    );
    return{api,instance};
  }

  async function call(name,data={}){
    const f=await functions();
    return (await f.api.httpsCallable(f.instance,name)(data)).data||{};
  }

  function isConfigured(){
    const c=providerConfig();
    return Boolean(
      c.enabled&&c.configured&&c.clientId&&
      !String(c.clientId).startsWith('REPLACE_')&&
      !String(c.clientId).startsWith('PASTE_')
    );
  }

  function returnUrl(){
    return `${location.origin}${location.pathname}${SOCIAL_HASH}`;
  }

  function profileUrl(account){
    return account?.username ? `https://x.com/${encodeURIComponent(account.username)}` : X_HOME;
  }

  function mirrorAccount(account){
    if(!account||!window.SigmaApp?.updateState)return;
    window.SigmaApp.updateState(state=>{
      if(!Array.isArray(state.socialAccounts))state.socialAccounts=[];
      const index=state.socialAccounts.findIndex(item=>item.provider==='x');
      const next={
        id:account.id||account.externalId||'x',
        provider:'x',
        label:account.displayName||account.title||account.username||'X',
        username:account.username||'',
        status:'connected',
        demo:false,
        avatar:account.avatar||'',
        sourceUrl:profileUrl(account),
        createdAt:index>=0?(state.socialAccounts[index].createdAt||new Date().toISOString()):new Date().toISOString(),
        updatedAt:new Date().toISOString()
      };
      if(index>=0)state.socialAccounts[index]={...state.socialAccounts[index],...next};
      else state.socialAccounts.push(next);
      if(state.socialSettings)state.socialSettings.lastSync=new Date().toISOString();
    });
    window.dispatchEvent(new CustomEvent('sigma:social-engine-updated'));
  }

  function removeMirroredAccount(){
    window.SigmaSocialStorage?.removeProvider?.('x');
    if(!window.SigmaApp?.updateState)return;
    window.SigmaApp.updateState(state=>{
      state.socialAccounts=(state.socialAccounts||[]).filter(item=>item.provider!=='x');
      state.socialInteractions=(state.socialInteractions||[]).filter(item=>item.provider!=='x');
    });
  }

  async function connect(){
    if(!isConfigured())throw new Error('Ajoutez le Client ID OAuth 2.0 X et déployez les fonctions X.');
    await waitForSigmaAuth();
    const result=await call('xCreateOAuthSession',{returnUrl:returnUrl()});
    if(!result.authUrl)throw new Error('URL OAuth X indisponible.');
    location.assign(result.authUrl);
  }

  async function sync(){
    if(!isConfigured())throw new Error('X n’est pas configuré.');
    await waitForSigmaAuth();
    const data=await call('xSync');
    window.SigmaSocialEngine?.ingest?.('x',data);
    const account=Array.isArray(data.accounts)?data.accounts[0]:null;
    if(account)mirrorAccount(account);
    return data;
  }

  async function disconnect(){
    const result=await call('xDisconnect');
    removeMirroredAccount();
    return result;
  }

  async function restoreConnectedState(){
    if(booting||!isConfigured())return;
    booting=true;
    try{
      await waitForSigmaAuth();
      await sync();
    }catch(error){
      const message=String(error?.message||'');
      if(/not connected|failed-precondition/i.test(message))removeMirroredAccount();
      else console.warn('[SigmaX] restore skipped',error);
    }finally{
      booting=false;
    }
  }

  async function handleReturn(){
    const url=new URL(location.href);
    const state=url.searchParams.get('sigmaX');
    if(!state)return false;

    const message=url.searchParams.get('message')||'';
    url.hash='social';
    history.replaceState({},document.title,`${url.pathname}${url.search}${url.hash}`);

    if(state!=='connected')throw new Error(message||'La connexion X a échoué.');

    await waitForSigmaAuth();
    await sync();

    url.searchParams.delete('sigmaX');
    url.searchParams.delete('message');
    url.hash='social';
    history.replaceState({},document.title,`${url.pathname}${url.search}${url.hash}`);
    return true;
  }

  const adapter={
    version:'4.10.1',
    capabilities:['profile','metrics','posts-ready'],
    isConfigured,
    sync
  };

  function register(){
    window.SigmaSocialEngine?.register?.('x',adapter);
  }

  async function boot(){
    register();
    try{
      const returned=await handleReturn();
      if(!returned)await restoreConnectedState();
    }catch(error){
      console.error('[SigmaX]',error);
      window.dispatchEvent(new CustomEvent('sigma:toast',{
        detail:{type:'error',message:`X : ${error.message||error}`}
      }));
    }
  }

  window.SigmaX=Object.freeze({
    version:'4.10.1',
    connect,sync,disconnect,isConfigured,
    restoreConnectedState,
    openProfile:()=>window.open(X_HOME,'_blank','noopener')
  });

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',boot,{once:true})
    :boot();

  window.addEventListener('sigma:auth-ready',restoreConnectedState);
  window.addEventListener('focus',()=>{ if(location.hash==='#social')restoreConnectedState(); });
})();

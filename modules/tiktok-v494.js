'use strict';
(() => {
  const providerConfig=()=>window.SIGMA_SOCIAL_CONFIG?.providers?.tiktok||{};
  const SOCIAL_HASH='#social';
  const TIKTOK_HOME='https://www.tiktok.com/';
  let api,instance,booting=false;

  function currentSigmaUser(){
    return window.SigmaCloud?.auth?.currentUser||window.SigmaCloud?.user||null;
  }

  async function waitForSigmaAuth(timeoutMs=60000){
    const existing=currentSigmaUser();
    if(existing)return existing;

    return new Promise((resolve,reject)=>{
      let settled=false;
      const finish=(error,user)=>{
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        window.removeEventListener('sigma:auth-changed',onAuthChanged);
        if(error)reject(error);
        else resolve(user);
      };
      const onAuthChanged=event=>{
        const user=event.detail?.user||currentSigmaUser();
        if(user)finish(null,user);
      };
      const timer=setTimeout(()=>{
        const user=currentSigmaUser();
        if(user)finish(null,user);
        else finish(new Error('La session Firebase Sigma n’est pas active. Déconnectez-vous puis reconnectez-vous à Sigma.'));
      },timeoutMs);

      window.addEventListener('sigma:auth-changed',onAuthChanged);

      // firebase-cloud.js may already have completed between the first check
      // and the event listener registration.
      queueMicrotask(()=>{
        const user=currentSigmaUser();
        if(user)finish(null,user);
      });
    });
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
    return(await f.api.httpsCallable(f.instance,name)(data)).data||{};
  }

  function isConfigured(){
    const c=providerConfig();
    return Boolean(
      c.enabled&&c.configured&&c.clientKey&&
      !String(c.clientKey).startsWith('REPLACE_')&&
      !String(c.clientKey).startsWith('PASTE_')
    );
  }

  function returnUrl(){
    return `${location.origin}${location.pathname}${SOCIAL_HASH}`;
  }

  function profileUrl(account){
    return account?.username
      ? `https://www.tiktok.com/@${encodeURIComponent(account.username)}`
      : TIKTOK_HOME;
  }

  function mirrorAccount(account){
    if(!account||!window.SigmaApp?.updateState)return;
    window.SigmaApp.updateState(state=>{
      if(!Array.isArray(state.socialAccounts))state.socialAccounts=[];
      const index=state.socialAccounts.findIndex(item=>item.provider==='tiktok');
      const next={
        id:account.id||account.externalId||'tiktok',
        provider:'tiktok',
        label:account.displayName||account.title||account.username||'TikTok',
        displayName:account.displayName||account.title||'',
        username:account.username||'',
        status:'connected',
        connected:true,
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
    window.dispatchEvent(new CustomEvent('sigma:tiktok-synced',{detail:{account}}));
  }

  function removeMirroredAccount(){
    window.SigmaSocialStorage?.removeProvider?.('tiktok');
    if(!window.SigmaApp?.updateState)return;
    window.SigmaApp.updateState(state=>{
      state.socialAccounts=(state.socialAccounts||[]).filter(item=>item.provider!=='tiktok');
      state.socialInteractions=(state.socialInteractions||[]).filter(item=>item.provider!=='tiktok');
    });
    window.dispatchEvent(new CustomEvent('sigma:social-engine-updated'));
  }

  async function connect(){
    if(!isConfigured())throw new Error('Ajoutez la TikTok Client Key et déployez les fonctions TikTok.');
    await waitForSigmaAuth();
    const result=await call('tiktokCreateOAuthSession',{returnUrl:returnUrl()});
    if(!result.authUrl)throw new Error('URL OAuth TikTok indisponible.');
    location.assign(result.authUrl);
  }

  async function status(){
    try{
      await waitForSigmaAuth();
      return await call('tiktokStatus');
    }catch(error){
      return{connected:false,error:String(error?.message||error)};
    }
  }

  async function sync(){
    if(!isConfigured())throw new Error('TikTok n’est pas configuré.');
    await waitForSigmaAuth();
    const data=await call('tiktokSync');
    window.SigmaSocialEngine?.ingest?.('tiktok',data);
    const account=Array.isArray(data.accounts)?data.accounts[0]:null;
    if(account)mirrorAccount(account);
    return data;
  }

  async function disconnect(){
    const result=await call('tiktokDisconnect');
    removeMirroredAccount();
    window.dispatchEvent(new CustomEvent('sigma:tiktok-disconnected'));
    return result;
  }

  async function restoreConnectedState(){
    if(booting||!isConfigured())return;
    booting=true;
    try{
      await waitForSigmaAuth();
      const current=await status();
      if(current?.connected){
        if(Array.isArray(current.accounts)&&current.accounts[0])mirrorAccount(current.accounts[0]);
        await sync();
      }else{
        removeMirroredAccount();
      }
    }catch(error){
      const message=String(error?.message||'');
      if(/not connected|failed-precondition/i.test(message))removeMirroredAccount();
      else console.warn('[SigmaTikTok] restore skipped',error);
    }finally{
      booting=false;
    }
  }

  async function handleReturn(){
    const url=new URL(location.href);
    const state=url.searchParams.get('sigmaTikTok');
    const provider=url.searchParams.get('provider');
    const connected=url.searchParams.get('connected');
    const isTikTokReturn=state!==null||provider==='tiktok';
    if(!isTikTokReturn)return false;

    const message=url.searchParams.get('message')||'';
    url.hash=SOCIAL_HASH;
    history.replaceState({},document.title,`${url.pathname}${url.search}${url.hash}`);

    if(state==='error')throw new Error(message||'La connexion TikTok a échoué.');
    if(state&&state!=='connected')throw new Error(message||'Réponse TikTok inattendue.');
    if(!state&&connected&&connected!=='1')throw new Error(message||'La connexion TikTok a échoué.');

    await waitForSigmaAuth();
    await sync();

    url.searchParams.delete('sigmaTikTok');
    url.searchParams.delete('provider');
    url.searchParams.delete('connected');
    url.searchParams.delete('message');
    url.hash=SOCIAL_HASH;
    history.replaceState({},document.title,`${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new CustomEvent('sigma:tiktok-connected'));
    return true;
  }

  const adapter={
    version:'4.10.4',
    capabilities:['profile'],
    isConfigured,
    sync
  };

  function register(){
    window.SigmaSocialEngine?.register?.('tiktok',adapter);
  }

  async function boot(){
    register();
    try{
      const returned=await handleReturn();
      if(!returned)await restoreConnectedState();
    }catch(error){
      console.error('[SigmaTikTok]',error);
      window.dispatchEvent(new CustomEvent('sigma:toast',{
        detail:{type:'error',message:`TikTok : ${error.message||error}`}
      }));
    }
  }

  window.SigmaTikTok=Object.freeze({
    version:'4.10.4',
    connect,sync,status,disconnect,isConfigured,
    restoreConnectedState,
    openProfile:()=>window.open(TIKTOK_HOME,'_blank','noopener')
  });

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',boot,{once:true})
    :boot();

  window.addEventListener('sigma:auth-changed',event=>{if(event.detail?.user)restoreConnectedState();});
  window.addEventListener('focus',()=>{if(location.hash===SOCIAL_HASH)restoreConnectedState();});
})();

'use strict';
(() => {
  const providerConfig=()=>window.SIGMA_SOCIAL_CONFIG?.providers?.linkedin||{};
  let api,instance;
  async function functions(){if(api&&instance)return{api,instance};if(!window.SigmaCloud?.configured||!window.SigmaCloud?.auth)throw new Error('Connectez-vous à Sigma avant LinkedIn.');api=await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js');instance=api.getFunctions(window.SigmaCloud.auth.app,window.SIGMA_SOCIAL_CONFIG?.firebaseFunctionsRegion||'europe-west1');return{api,instance};}
  async function call(name,data={}){const f=await functions();return (await f.api.httpsCallable(f.instance,name)(data)).data||{};}
  function isConfigured(){const c=providerConfig();return Boolean(c.enabled&&c.configured&&c.clientId&&!String(c.clientId).startsWith('REPLACE_'));}
  async function connect(){if(!isConfigured())throw new Error('Ajoutez le LinkedIn Client ID dans social-config.js et déployez les fonctions LinkedIn.');const returnUrl=`${location.origin}${location.pathname}?sigmaView=social`;const result=await call('linkedinCreateOAuthSession',{returnUrl});if(!result.authUrl)throw new Error('URL OAuth LinkedIn indisponible.');location.assign(result.authUrl);}
  async function sync(){if(!isConfigured())throw new Error('LinkedIn n’est pas configuré.');const data=await call('linkedinSync');window.SigmaSocialEngine?.ingest?.('linkedin',data);window.dispatchEvent(new CustomEvent('sigma:linkedin-synced',{detail:data}));return data;}
  async function status(){try{return await call('linkedinStatus');}catch{return{connected:false};}}
  async function disconnect(){const result=await call('linkedinDisconnect');window.SigmaSocialStorage?.removeProvider?.('linkedin');window.dispatchEvent(new CustomEvent('sigma:linkedin-disconnected'));return result;}
  async function handleReturn(){
    const url=new URL(location.href),state=url.searchParams.get('sigmaLinkedIn');
    const requestedView=url.searchParams.get('sigmaView');
    if(requestedView==='social'){
      url.searchParams.delete('sigmaView');
      url.hash='social';
    }
    if(!state){
      if(requestedView==='social')history.replaceState({},document.title,`${url.pathname}${url.search}${url.hash}`);
      return;
    }
    url.searchParams.delete('sigmaLinkedIn');
    url.searchParams.delete('message');
    history.replaceState({},document.title,`${url.pathname}${url.search}${url.hash||'#social'}`);
    if(state==='connected'){
      await sync();
      window.dispatchEvent(new CustomEvent('sigma:linkedin-connected'));
    }
  }
  const adapter={version:'4.9.9',capabilities:['profile','posts'],isConfigured,sync};
  function register(){window.SigmaSocialEngine?.register?.('linkedin',adapter);}
  window.SigmaLinkedIn=Object.freeze({version:'4.9.9',connect,sync,status,disconnect,isConfigured});
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>{register();handleReturn();},{once:true}):(register(),handleReturn());
})();

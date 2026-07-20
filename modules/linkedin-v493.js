'use strict';
(() => {
  const providerConfig=()=>window.SIGMA_SOCIAL_CONFIG?.providers?.linkedin||{};
  let api,instance;
  async function functions(){if(api&&instance)return{api,instance};if(!window.SigmaCloud?.configured||!window.SigmaCloud?.auth)throw new Error('Connectez-vous à Sigma avant LinkedIn.');api=await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js');instance=api.getFunctions(window.SigmaCloud.auth.app,window.SIGMA_SOCIAL_CONFIG?.firebaseFunctionsRegion||'europe-west1');return{api,instance};}
  async function call(name,data={}){const f=await functions();return (await f.api.httpsCallable(f.instance,name)(data)).data||{};}
  function isConfigured(){const c=providerConfig();return Boolean(c.enabled&&c.configured&&c.clientId&&!String(c.clientId).startsWith('REPLACE_'));}
  async function connect(){if(!isConfigured())throw new Error('Ajoutez le LinkedIn Client ID dans social-config.js et déployez les fonctions V4.9.3.');const result=await call('linkedinCreateOAuthSession',{returnUrl:location.href.split(/[?#]/)[0]});if(!result.authUrl)throw new Error('URL OAuth LinkedIn indisponible.');location.assign(result.authUrl);}
  async function sync(){if(!isConfigured())throw new Error('LinkedIn n’est pas configuré.');const data=await call('linkedinSync');window.SigmaSocialEngine?.ingest?.('linkedin',data);return data;}
  async function status(){try{return await call('linkedinStatus');}catch{return{connected:false};}}
  async function disconnect(){return call('linkedinDisconnect');}
  async function handleReturn(){const url=new URL(location.href),state=url.searchParams.get('sigmaLinkedIn');if(!state)return;url.searchParams.delete('sigmaLinkedIn');url.searchParams.delete('message');history.replaceState({},document.title,`${url.pathname}${url.search}${url.hash}`);if(state==='connected')await sync().catch(console.error);}
  const adapter={version:'4.9.3',capabilities:['profile','posts'],isConfigured,sync};
  function register(){window.SigmaSocialEngine?.register?.('linkedin',adapter);}
  window.SigmaLinkedIn=Object.freeze({version:'4.9.3',connect,sync,status,disconnect,isConfigured});
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>{register();handleReturn();},{once:true}):(register(),handleReturn());
})();

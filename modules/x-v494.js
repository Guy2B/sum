'use strict';
(() => {
  const config=()=>window.SIGMA_SOCIAL_CONFIG?.providers?.x||{};let api,instance;
  async function fn(){if(api&&instance)return{api,instance};if(!window.SigmaCloud?.configured||!window.SigmaCloud?.auth)throw new Error('Connectez-vous à Sigma.');api=await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js');instance=api.getFunctions(window.SigmaCloud.auth.app,window.SIGMA_SOCIAL_CONFIG?.firebaseFunctionsRegion||'europe-west1');return{api,instance};}
  async function call(name,data={}){const f=await fn();return(await f.api.httpsCallable(f.instance,name)(data)).data||{};}
  function isConfigured(){const c=config();return Boolean(c.enabled&&c.configured&&c.clientId&&!String(c.clientId).startsWith('REPLACE_'));}
  async function connect(){if(!isConfigured())throw new Error('Ajoutez le X Client ID et déployez les fonctions V4.9.4.');const r=await call('xCreateOAuthSession',{returnUrl:location.href.split(/[?#]/)[0]});if(!r.authUrl)throw new Error('URL OAuth X indisponible.');location.assign(r.authUrl);}
  async function sync(){const data=await call('xSync');window.SigmaSocialEngine?.ingest?.('x',data);return data;}
  async function disconnect(){return call('xDisconnect');}
  async function handle(){const u=new URL(location.href),s=u.searchParams.get('sigmaX');if(!s)return;u.searchParams.delete('sigmaX');u.searchParams.delete('message');history.replaceState({},document.title,`${u.pathname}${u.search}${u.hash}`);if(s==='connected')await sync().catch(console.error);}
  function register(){window.SigmaSocialEngine?.register?.('x',{version:'4.9.4',capabilities:['profile','posts'],isConfigured,sync});}
  window.SigmaX=Object.freeze({version:'4.9.4',connect,sync,disconnect,isConfigured});document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>{register();handle();},{once:true}):(register(),handle());
})();

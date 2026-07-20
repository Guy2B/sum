'use strict';
(() => {
  const config=()=>window.SIGMA_SOCIAL_CONFIG?.providers?.tiktok||{};let api,instance;
  async function fn(){if(api&&instance)return{api,instance};if(!window.SigmaCloud?.configured||!window.SigmaCloud?.auth)throw new Error('Connectez-vous à Sigma.');api=await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js');instance=api.getFunctions(window.SigmaCloud.auth.app,window.SIGMA_SOCIAL_CONFIG?.firebaseFunctionsRegion||'europe-west1');return{api,instance};}
  async function call(name,data={}){const f=await fn();return(await f.api.httpsCallable(f.instance,name)(data)).data||{};}
  function isConfigured(){const c=config();return Boolean(c.enabled&&c.configured&&c.clientKey&&!String(c.clientKey).startsWith('REPLACE_'));}
  async function connect(){if(!isConfigured())throw new Error('Ajoutez la TikTok Client Key et déployez les fonctions V4.9.4.');const r=await call('tiktokCreateOAuthSession',{returnUrl:location.href.split(/[?#]/)[0]});if(!r.authUrl)throw new Error('URL OAuth TikTok indisponible.');location.assign(r.authUrl);}
  async function sync(){const data=await call('tiktokSync');window.SigmaSocialEngine?.ingest?.('tiktok',data);return data;}
  async function disconnect(){return call('tiktokDisconnect');}
  async function handle(){const u=new URL(location.href),s=u.searchParams.get('sigmaTikTok');if(!s)return;u.searchParams.delete('sigmaTikTok');u.searchParams.delete('message');history.replaceState({},document.title,`${u.pathname}${u.search}${u.hash}`);if(s==='connected')await sync().catch(console.error);}
  function register(){window.SigmaSocialEngine?.register?.('tiktok',{version:'4.9.4',capabilities:['profile','videos'],isConfigured,sync});}
  window.SigmaTikTok=Object.freeze({version:'4.9.4',connect,sync,disconnect,isConfigured});document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>{register();handle();},{once:true}):(register(),handle());
})();

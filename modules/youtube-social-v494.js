'use strict';
(() => {
  function isConfigured(){return Boolean(window.SigmaGoogle?.configured?.());}
  async function sync(){if(!window.SigmaGoogle?.importYouTube)throw new Error('Le connecteur Google/YouTube est indisponible.');const rows=await window.SigmaGoogle.importYouTube();const subscriptions=Array.isArray(rows)?rows:[];return{accounts:[{id:'youtube_google',externalId:'youtube_google',provider:'youtube',displayName:'YouTube',title:'YouTube',connected:true,permissions:['youtube.readonly'],lastSyncAt:new Date().toISOString()}],posts:[],messages:[],comments:[],metrics:[{id:'youtube_subscriptions',externalId:'youtube_subscriptions',provider:'youtube',name:'subscriptions',title:'Abonnements',value:subscriptions.length,unit:'channels',period:'current'}],notifications:subscriptions.slice(0,50).map((item,index)=>({id:`youtube_subscription_${item.id||index}`,externalId:item.id||String(index),provider:'youtube',title:item.title||item.snippet?.title||'Chaîne YouTube',text:'Abonnement YouTube',url:item.url||'',status:'info',raw:item})),syncedAt:new Date().toISOString()};}
  function register(){window.SigmaSocialEngine?.register?.('youtube',{version:'4.9.4',capabilities:['subscriptions','channel'],isConfigured,sync});}
  window.SigmaYouTubeSocial=Object.freeze({version:'4.9.4',sync,isConfigured});
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',register,{once:true}):register();
})();

'use strict';
(() => {
  function isConfigured(){return Boolean(window.SigmaGoogle?.configured?.());}
  async function sync(){
    if(!window.SigmaGoogle?.importYouTube) throw new Error('Le connecteur Google/YouTube est indisponible.');
    const rows=await window.SigmaGoogle.importYouTube();
    const subscriptions=Array.isArray(rows)?rows:[];
    const now=new Date().toISOString();
    return {
      accounts:[{id:'youtube_google',externalId:'youtube_google',provider:'youtube',displayName:'YouTube',title:'YouTube',connected:true,permissions:['youtube.readonly'],lastSyncAt:now}],
      posts:[],messages:[],comments:[],
      metrics:[{id:'youtube_subscriptions',externalId:'youtube_subscriptions',provider:'youtube',name:'subscriptions',title:'Abonnements',value:subscriptions.length,unit:'channels',period:'current'}],
      notifications:subscriptions.slice(0,50).map((item,index)=>({id:`youtube_subscription_${item.channelId||item.id||index}`,externalId:item.channelId||item.id||String(index),provider:'youtube',title:item.title||'Chaîne YouTube',text:item.description||'Abonnement YouTube',url:item.channelId?`https://www.youtube.com/channel/${item.channelId}`:'',status:'info',raw:item})),
      syncedAt:now
    };
  }
  function register(){window.SigmaSocialEngine?.register?.('youtube',{version:'4.9.5',capabilities:['subscriptions','channel'],isConfigured,sync});}
  window.SigmaYouTubeSocial=Object.freeze({version:'4.9.5',sync,isConfigured});
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',register,{once:true}):register();
})();

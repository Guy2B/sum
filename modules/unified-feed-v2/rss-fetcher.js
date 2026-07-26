(function(g){
  async function fetchSource(source){
    const endpoint=(window.SUM_CONFIG?.rssProxyBaseUrl||'').replace(/\/$/,'');
    if(!endpoint) return {source,items:[],error:'RSS proxy non configuré'};
    const response=await fetch(`${endpoint}?url=${encodeURIComponent(source.url)}`,{credentials:'omit'});
    if(!response.ok)throw new Error(`RSS ${response.status}`);
    const data=await response.json();
    return {source,items:(data.items||[]).map(x=>window.SigmaUnifiedFeedNormalizer.normalize(x,'rss'))};
  }
  async function fetchAll(sources){return Promise.all(sources.filter(x=>x.enabled!==false).map(async s=>{try{return await fetchSource(s);}catch(e){return{source:s,items:[],error:e.message};}}));}
  g.SigmaUnifiedFeedRSSFetcher={fetchSource,fetchAll};
})(window);

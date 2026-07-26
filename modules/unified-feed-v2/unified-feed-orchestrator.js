(function(g){
  async function clickAndWait(id,eventName,timeout=12000){
    const button=document.getElementById(id);if(!button)return {ok:false,error:`${id} absent`};
    button.click();
    if(!eventName){await new Promise(r=>setTimeout(r,1200));return{ok:true};}
    return new Promise(resolve=>{let done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener(eventName,on);resolve(v)};const on=e=>finish({ok:true,detail:e.detail});window.addEventListener(eventName,on,{once:true});const timer=setTimeout(()=>finish({ok:true,timeout:true}),timeout);});
  }
  async function sync(){
    const errors=[];
    await Promise.all([
      clickAndWait('mail-sync',null).catch(e=>errors.push(e.message)),
      clickAndWait('social-sync','sigma:social-sync-state').catch(e=>errors.push(e.message))
    ]);
    const state=window.SigmaApp?.getState?.()||{};
    const adapter=window.SigmaExistingConnectorsAdapter;
    let items=[...adapter.mail(state),...adapter.social(state)];
    const rss=await window.SigmaUnifiedFeedRSSFetcher.fetchAll(window.SigmaUnifiedFeedRSS.list());
    rss.forEach(r=>{items.push(...r.items);if(r.error)errors.push(`${r.source.name}: ${r.error}`)});
    items=window.SigmaUnifiedFeedDeduplicator.deduplicate(items)
      .map(x=>window.SigmaUnifiedFeedContext.link(x,state))
      .map(x=>({...x,opportunities:window.SigmaUnifiedFeedOpportunity.detect(x)}));
    items=window.SigmaUnifiedFeedPriority.rank(items);
    const result={items,lastSyncAt:new Date().toISOString(),errors,connected:adapter.accounts(state).filter(x=>x.status!=='disconnected').length};
    window.SigmaUnifiedFeedStore.save(result);
    window.dispatchEvent(new CustomEvent('sigma:unified-feed-updated',{detail:result}));
    return result;
  }
  g.SigmaUnifiedFeedOrchestrator={sync,read:()=>window.SigmaUnifiedFeedStore.load()};
})(window);

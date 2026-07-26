(function(g){
  function key(x){return x.url||`${x.provider}|${x.id}`||`${x.title}|${x.publishedAt}`;}
  function deduplicate(items){
    const seen=new Map();
    for(const item of items){
      const k=key(item);
      const prev=seen.get(k);
      if(!prev||new Date(item.publishedAt)>new Date(prev.publishedAt)) seen.set(k,item);
    }
    return [...seen.values()];
  }
  g.SigmaUnifiedFeedDeduplicator={deduplicate};
})(window);

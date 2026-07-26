(function(g){
  const ageMs=value=>value?Date.now()-new Date(value).getTime():Infinity;
  function classify(value){
    const age=ageMs(value);
    if(age<=15*60*1000)return'fresh';
    if(age<=24*60*60*1000)return'recent';
    if(age<=7*24*60*60*1000)return'stale';
    return'unknown';
  }
  function inspect(source){
    const updatedAt=source.updatedAt||source.lastSyncAt||null;
    return{...source,updatedAt,ageMs:ageMs(updatedAt),freshness:updatedAt?classify(updatedAt):source.freshness||'unknown'};
  }
  function all(){return (window.SigmaDataSourceRegistryV1?.list?.()||[]).map(inspect);}
  g.SigmaFreshnessEngineV1={classify,inspect,all};
})(window);

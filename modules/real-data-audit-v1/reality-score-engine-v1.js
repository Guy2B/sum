(function(g){
  const originWeight={real:1,mixed:.65,local:.45,derived:.35,demo:.1,unknown:0};
  const syncWeight={realtime:1,scheduled:.85,automatic:.8,manual:.45,none:.1,'on-demand':.4,unknown:0};
  const confidenceWeight={high:1,medium:.65,low:.3,unknown:0};
  function score(source){
    const a=originWeight[source.origin]??0,b=syncWeight[source.sync]??0,c=confidenceWeight[source.confidence]??0;
    const freshness={fresh:1,recent:.8,stale:.35,unknown:.15}[source.freshness]??.15;
    const value=Math.round((a*.45+b*.25+c*.15+freshness*.15)*100);
    return{...source,realityScore:value};
  }
  function all(){
    const rows=(window.SigmaFreshnessEngineV1?.all?.()||window.SigmaDataSourceRegistryV1?.list?.()||[]).map(score);
    const overall=rows.length?Math.round(rows.reduce((s,x)=>s+x.realityScore,0)/rows.length):0;
    return{overall,rows};
  }
  g.SigmaRealityScoreEngineV1={score,all};
})(window);

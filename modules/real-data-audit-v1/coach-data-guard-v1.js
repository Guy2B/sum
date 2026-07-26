(function(g){
  function assess(sourceId){
    const source=window.SigmaDataSourceRegistryV1?.get?.(sourceId);
    if(!source)return{allowed:false,reason:'source-unknown',sourceId};
    const scored=window.SigmaRealityScoreEngineV1?.score?.(window.SigmaFreshnessEngineV1?.inspect?.(source)||source)||source;
    const allowed=scored.origin!=='demo'&&scored.realityScore>=35;
    return{allowed,reason:allowed?'sufficient':'insufficient-reality',source:scored};
  }
  function filter(sourceIds=[]){
    const checks=sourceIds.map(assess);
    return{allowed:checks.filter(x=>x.allowed),blocked:checks.filter(x=>!x.allowed)};
  }
  function explain(result){
    if(result.allowed)return`Source autorisée · score ${result.source.realityScore}/100 · ${result.source.origin}`;
    return`Source bloquée · ${result.reason}`;
  }
  g.SigmaCoachDataGuardV1={assess,filter,explain};
})(window);

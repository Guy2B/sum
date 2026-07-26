(function(g){
  function build(){
    return{
      release:644,
      generatedAt:new Date().toISOString(),
      registry:window.SigmaDataSourceRegistryV1?.list?.()||[],
      reality:window.SigmaRealityScoreEngineV1?.all?.()||{},
      localStorage:window.SigmaLocalStorageInventoryV1?.summary?.()||{},
      migration:window.SigmaMigrationPlannerV1?.estimate?.()||{},
      canonicalModel:window.SigmaFirebaseCanonicalModelV1?.validate?.()||{}
    };
  }
  function download(){
    const report=build();
    const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=`sigma-data-reality-audit-${Date.now()}.json`;
    a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  g.SigmaDataAuditReportV1={build,download};
})(window);

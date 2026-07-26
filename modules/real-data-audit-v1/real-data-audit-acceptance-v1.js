(function(g){
  g.SigmaRealDataAuditAcceptanceV1={validate(){
    const required=['SigmaDataSourceRegistryV1','SigmaFreshnessEngineV1','SigmaRealityScoreEngineV1','SigmaLocalStorageInventoryV1','SigmaFirebaseCanonicalModelV1','SigmaMigrationPlannerV1','SigmaCoachDataGuardV1','SigmaProvenanceLabelsV1','SigmaDataRealityDashboardV1','SigmaDataAuditReportV1'];
    const missing=required.filter(x=>!g[x]);
    const model=g.SigmaFirebaseCanonicalModelV1?.validate?.()||{ok:false};
    return{ok:missing.length===0&&model.ok,missing,model,release:644};
  }};
})(window);

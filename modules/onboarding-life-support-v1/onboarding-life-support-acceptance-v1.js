(function(g){
  g.SigmaOnboardingLifeSupportAcceptanceV1={validate(){
    const required=['SigmaOnboardingStateV1','SigmaLifeProfileProposalsV1','SigmaSupportProfileProposalsV1','SigmaActiveProfileStoreV1','SigmaExistingProfileMigrationV1','SigmaOnboardingRecommendationEngineV1','SigmaSignupOnboardingTriggerV1','SigmaOnboardingUIV1','SigmaCompactContextProfilesV1','SigmaOnboardingDataSourceBridgeV1'];
    const missing=required.filter(x=>!g[x]);
    return{ok:missing.length===0,missing,release:689};
  }};
})(window);

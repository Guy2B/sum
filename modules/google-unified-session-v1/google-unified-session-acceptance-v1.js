(function(g){
  g.SigmaGoogleUnifiedSessionAcceptanceV1={validate(){
    const required=['SigmaConnectorRegistryV1','SigmaConnectorInventoryV1','SigmaLegacyConnectorMigrationV1','SigmaGoogleScopeCatalogV1','SigmaGoogleAccountBridgeV1','SigmaGoogleUnifiedOAuthV1','SigmaGoogleConsentOnboardingV1','SigmaGoogleConnectorAutoloadV1','SigmaConnectorNavigationRecoveryV1','SigmaNonGoogleConnectorPreserverV1','SigmaConnectorFirestoreSyncV1','SigmaGoogleUnifiedSessionDiagnosticsV1'];
    const missing=required.filter(x=>!g[x]);
    return{ok:missing.length===0,missing,release:734};
  }};
})(window);

(function(g){
  async function run(){
    const identity=window.SigmaGoogleAccountBridgeV1.identity();
    const registry=window.SigmaConnectorRegistryV1.read();
    return{
      ok:identity.authenticated&&identity.google,
      release:734,
      identity,
      oauthReady:window.SigmaGoogleUnifiedOAuthV1.ready(),
      tokenValid:window.SigmaGoogleUnifiedOAuthV1.hasValidToken(),
      consent:window.SigmaGoogleConsentOnboardingV1.read(),
      connectors:registry,
      installed:registry.filter(x=>x.installed).map(x=>x.id),
      unavailable:registry.filter(x=>x.status==='unavailable').map(x=>x.id),
      checkedAt:new Date().toISOString()
    };
  }
  g.SigmaGoogleUnifiedSessionDiagnosticsV1={run};
})(window);

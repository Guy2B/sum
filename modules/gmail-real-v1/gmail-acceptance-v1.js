(function(g){
  g.SigmaGmailAcceptanceV1={validate(){
    const required=['SigmaGmailConfigV1','SigmaGmailAuthSessionV1','SigmaGmailMessageNormalizerV1','SigmaGmailClientV1','SigmaGmailStoreV1','SigmaGmailSyncV1','SigmaGmailPriorityEngineV1','SigmaGmailActionExtractorV1','SigmaCoachGmailBridgeV1','SigmaGmailUIV1','SigmaGmailDiagnosticsV1'];
    const missing=required.filter(x=>!g[x]);
    return{ok:missing.length===0,missing,release:674,configurationRequired:!g.SigmaGmailConfigV1?.ready?.()};
  }};
})(window);

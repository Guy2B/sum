(function(g){
  async function run(){
    const auth=window.SigmaGmailAuthSessionV1.status();
    const sync=window.SigmaGmailSyncV1.status();
    const clientReady=Boolean(window.gapi?.client?.gmail);
    const cache=window.SigmaGmailStoreV1.read();
    return{
      ok:window.SigmaGmailConfigV1.ready()&&auth.authenticated&&clientReady,
      release:674,
      configReady:window.SigmaGmailConfigV1.ready(),
      auth,clientReady,sync,
      profile:cache.profile,
      messages:cache.messages.length,
      unread:cache.messages.filter(x=>x.unread).length,
      proposedActions:window.SigmaGmailActionExtractorV1.all().length,
      checkedAt:new Date().toISOString()
    };
  }
  g.SigmaGmailDiagnosticsV1={run};
})(window);

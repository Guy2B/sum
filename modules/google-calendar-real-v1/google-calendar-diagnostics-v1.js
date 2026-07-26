(function(g){
  async function run(){
    const config=window.SigmaGoogleCalendarConfigV1.read();
    const auth=window.SigmaGoogleAuthSessionV1.status();
    const sync=window.SigmaGoogleCalendarSyncV1.status();
    const clientReady=Boolean(window.gapi?.client?.calendar);
    return{
      ok:window.SigmaGoogleCalendarConfigV1.ready()&&auth.authenticated&&clientReady,
      release:659,
      configReady:window.SigmaGoogleCalendarConfigV1.ready(),
      auth,
      clientReady,
      sync,
      cache:window.SigmaGoogleCalendarStoreV1.read(),
      conflicts:window.SigmaCalendarConflictAdapterV1.conflicts().length,
      checkedAt:new Date().toISOString()
    };
  }
  g.SigmaGoogleCalendarDiagnosticsV1={run};
})(window);

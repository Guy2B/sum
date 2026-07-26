(function(g){
  g.SigmaGoogleCalendarAcceptanceV1={validate(){
    const required=['SigmaGoogleCalendarConfigV1','SigmaGoogleScriptLoaderV1','SigmaGoogleAuthSessionV1','SigmaGoogleCalendarClientV1','SigmaGoogleCalendarStoreV1','SigmaGoogleCalendarSyncV1','SigmaCalendarConflictAdapterV1','SigmaCoachGoogleCalendarBridgeV1','SigmaGoogleCalendarUIV1','SigmaGoogleCalendarDiagnosticsV1'];
    const missing=required.filter(x=>!g[x]);
    return{ok:missing.length===0,missing,release:659,configurationRequired:!g.SigmaGoogleCalendarConfigV1?.ready?.()};
  }};
})(window);

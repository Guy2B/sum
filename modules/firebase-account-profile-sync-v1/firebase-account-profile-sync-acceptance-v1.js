(function(g){
  g.SigmaFirebaseAccountProfileSyncAcceptanceV1={validate(){
    const required=['SigmaFirebaseRuntimeAdapterV1','SigmaAccountBootstrapV1','SigmaFirebaseAccountStoreV1','SigmaProfileCloudSyncV1','SigmaProfileConflictResolverV1','SigmaAccountFirstSyncV1','SigmaProfileAutoSyncV1','SigmaCrossDeviceIndicatorV1','SigmaAccountDataExportV1','SigmaFirebaseProfileDiagnosticsV1','SigmaFirebaseProfileUIActionsV1'];
    const missing=required.filter(x=>!g[x]);
    return{ok:missing.length===0,missing,release:704};
  }};
})(window);

(function(g){
  function sync(){
    const active=window.SigmaActiveProfileStoreV1.read();
    const updatedAt=active.updatedAt||new Date().toISOString();
    window.SigmaDataSourceRegistryV1?.upsert?.({
      id:'life-profiles',
      label:'Profils de vie',
      origin:'real',
      storage:'local profile state',
      sync:'on-demand',
      freshness:'fresh',
      confidence:'high',
      lastSyncAt:updatedAt
    });
    window.SigmaDataSourceRegistryV1?.upsert?.({
      id:'support-profiles',
      label:'Accompagnements actifs',
      origin:'real',
      storage:'local profile state',
      sync:'on-demand',
      freshness:'fresh',
      confidence:'high',
      lastSyncAt:updatedAt
    });
    return active;
  }
  window.addEventListener('sigma:active-life-support-updated',sync);
  g.SigmaOnboardingDataSourceBridgeV1={sync};
})(window);

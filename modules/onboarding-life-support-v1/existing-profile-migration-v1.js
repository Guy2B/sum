(function(g){
  function collectIds(rows=[]){
    return rows.map(x=>x.id||x.type||x.profileId).filter(Boolean);
  }
  function inspect(){
    const life =
      window.SigmaLifeProfileCatalog?.list?.() ||
      window.SigmaLifeProfiles?.list?.() ||
      [];
    const support =
      window.SigmaSupportPlansV3?.list?.() ||
      window.SigmaSupportProfileCatalogV3?.list?.() ||
      [];
    return{
      lifeProfiles:collectIds(life),
      supportProfiles:collectIds(support.filter(x=>x.active!==false)),
      found:life.length+support.length
    };
  }
  function migrate(){
    const existing=window.SigmaActiveProfileStoreV1.read();
    if(existing.lifeProfiles.length||existing.supportProfiles.length)return{migrated:false,reason:'already-configured',state:existing};
    const source=inspect();
    const life=source.lifeProfiles.filter(id=>window.SigmaLifeProfileProposalsV1.get(id));
    const support=source.supportProfiles.filter(id=>window.SigmaSupportProfileProposalsV1.get(id));
    if(!life.length&&!support.length)return{migrated:false,reason:'nothing-compatible',source};
    return{migrated:true,state:window.SigmaActiveProfileStoreV1.replace(life,support),source};
  }
  g.SigmaExistingProfileMigrationV1={inspect,migrate};
})(window);

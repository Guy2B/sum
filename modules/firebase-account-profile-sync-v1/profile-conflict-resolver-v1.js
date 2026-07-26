(function(g){
  function stamp(value){return new Date(value?.updatedAt||value?.syncedAt||0).getTime()||0;}
  function resolve(local,remote){
    if(!remote)return{winner:'local',value:local,reason:'remote-empty'};
    if(!local)return{winner:'remote',value:remote,reason:'local-empty'};
    const l=stamp(local),r=stamp(remote);
    if(r>l)return{winner:'remote',value:remote,reason:'remote-newer'};
    if(l>r)return{winner:'local',value:local,reason:'local-newer'};
    const merged={
      ...remote,
      ...local,
      lifeProfiles:[...new Set([...(remote.lifeProfiles||[]),...(local.lifeProfiles||[])])],
      supportProfiles:[...new Set([...(remote.supportProfiles||[]),...(local.supportProfiles||[])])],
      updatedAt:new Date().toISOString()
    };
    return{winner:'merged',value:merged,reason:'same-timestamp'};
  }
  g.SigmaProfileConflictResolverV1={stamp,resolve};
})(window);

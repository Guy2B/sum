(function(g){
  function inspect(snapshot){
    const warnings=[];
    if(!snapshot.metrics.connected)warnings.push({level:'high',code:'no-source',message:'Aucune source connectée visible'});
    if(snapshot.feed.errors?.length)warnings.push({level:'medium',code:'feed-errors',message:`${snapshot.feed.errors.length} erreur(s) de synchronisation`});
    if(snapshot.metrics.pendingApprovals>=5)warnings.push({level:'medium',code:'approval-backlog',message:'File d’approbation élevée'});
    if(snapshot.metrics.openActions>=20)warnings.push({level:'medium',code:'action-backlog',message:'Trop d’actions ouvertes'});
    return {ok:warnings.length===0,warnings,checkedAt:new Date().toISOString()};
  }
  g.SigmaHealthMonitor={inspect};
})(window);

(function(g){
  function build(snapshot){
    const m=snapshot.metrics;
    const top=(snapshot.today||[]).slice(0,5);
    const risks=(snapshot.risks||[]).slice(0,3);
    const opportunities=(snapshot.opportunities||[]).slice(0,3);
    return {
      date:new Date().toISOString(),
      headline:`${m.urgent} priorités · ${m.openActions} actions ouvertes · ${m.pendingApprovals} approbations`,
      top,
      risks,
      opportunities,
      summary:[
        m.connected?`${m.connected} sources actives`:'Aucune source active détectée',
        `${m.signals} signaux analysés`,
        `${m.completedExecutions} exécutions terminées`
      ]
    };
  }
  g.SigmaDailyBrief={build};
})(window);

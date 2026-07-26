(function(g){
  function detect(actions,hours=48){
    const limit=Date.now()-(hours*36e5);
    return actions.filter(x=>x.state==='open'&&new Date(x.createdAt||x.source?.publishedAt||0).getTime()<limit)
      .map(x=>({...x,stale:true,staleHours:Math.floor((Date.now()-new Date(x.createdAt||x.source?.publishedAt||0))/36e5)}));
  }
  g.SigmaStaleDetector={detect};
})(window);

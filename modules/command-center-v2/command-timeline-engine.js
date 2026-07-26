(function(g){
  function build({feed={},history=[],executions=[]}={}){
    const rows=[];
    for(const item of feed.items||[])rows.push({at:item.publishedAt,type:'signal',title:item.title,provider:item.provider});
    for(const entry of history||[])rows.push({at:entry.at,type:'decision',title:entry.label||entry.type,provider:'sigma'});
    for(const entry of executions||[])rows.push({at:entry.at,type:'execution',title:entry.operation,provider:'sigma'});
    return rows.filter(x=>x.at).sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,50);
  }
  g.SigmaCommandTimeline={build};
})(window);

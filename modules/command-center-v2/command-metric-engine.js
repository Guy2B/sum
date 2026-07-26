(function(g){
  function compute({feed={},actions={},approvals=[],executions=[]}={}){
    const items=feed.items||[];
    const actionRows=actions.actions||actions.today||[];
    const open=actionRows.filter(x=>x.state==='open');
    const completed=executions.filter(x=>x.ok);
    const urgent=items.filter(x=>['critical','high'].includes(x.priority?.level));
    return {
      connected:Number(feed.connected||0),
      signals:items.length,
      urgent:urgent.length,
      openActions:open.length,
      pendingApprovals:approvals.filter(x=>x.status==='pending').length,
      completedExecutions:completed.length,
      responseRate:actionRows.length?Math.round((completed.length/actionRows.length)*100):0
    };
  }
  g.SigmaCommandMetrics={compute};
})(window);

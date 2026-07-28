(function(g){
  function rebuild(){
    const feed=window.SigmaUnifiedFeedStore?.load?.()||{items:[],errors:[],connected:0};
    const actionState=window.SigmaActionState?.load?.()||{actions:[]};
    const actionView=window.SigmaActionCenter?.rebuild?.()||{today:[],risks:[],opportunities:[],communications:[]};
    const approvals=window.SigmaApprovalQueue?.list?.()||[];
    const executions=window.SigmaExecutionResults?.list?.()||[];
    const history=window.SigmaDecisionHistory?.list?.()||[];
    const metrics=window.SigmaCommandMetrics.compute({feed,actions:actionState,approvals,executions});
    const focus=window.SigmaFocusRanking.rank(actionView.today||actionState.actions||[]);
    const stale=window.SigmaStaleDetector.detect(actionState.actions||[]);
    const snapshot={
      feed,actions:actionState,approvals,executions,history,metrics,
      today:focus,risks:actionView.risks||[],opportunities:actionView.opportunities||[],
      stale,
      timeline:window.SigmaCommandTimeline.build({feed,history,executions}),
      generatedAt:new Date().toISOString()
    };
    snapshot.brief=window.SigmaDailyBrief.build(snapshot);
    snapshot.health=window.SigmaHealthMonitor.inspect(snapshot);
    window.SigmaCommandSnapshot.save(snapshot);
    window.dispatchEvent(new CustomEvent('sigma:command-center-updated',{detail:snapshot}));
    return snapshot;
  }
  async function refreshAll(){
    if(window.SigmaUnifiedFeedOrchestrator?.sync)await window.SigmaUnifiedFeedOrchestrator.sync();
    return rebuild();
  }
  g.SigmaCommandCenter={rebuild,refreshAll,load:()=>window.SigmaCommandSnapshot.load()};
})(window);

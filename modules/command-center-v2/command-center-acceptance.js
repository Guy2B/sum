(function(g){
  g.SigmaCommandCenterAcceptance={validate(){
    const required=['SigmaCommandMetrics','SigmaDailyBrief','SigmaFocusRanking','SigmaHealthMonitor','SigmaCommandSnapshot','SigmaCommandTimeline','SigmaStaleDetector','SigmaCommandCenter','SigmaCommandCenterUI'];
    const missing=required.filter(k=>!g[k]);
    return{ok:missing.length===0,missing};
  }};
})(window);

(function(g){
  g.SigmaActionCenterAcceptance={validate(){
    const required=['SigmaActionNormalizer','SigmaActionClassifier','SigmaActionSuggestions','SigmaActionExplanation','SigmaDecisionHistory','SigmaActionState','SigmaTodayPlanner','SigmaActionViews','SigmaActionExecutor','SigmaActionCenter','SigmaActionCenterUI'];
    const missing=required.filter(k=>!g[k]);
    return{ok:missing.length===0,missing};
  }};
})(window);

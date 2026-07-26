(function(g){
  g.SigmaAutomationStudioAcceptance={validate(){
    const required=['SigmaAutomationRules','SigmaAutomationRuns','SigmaAutomationScheduler','SigmaAutomationConditions','SigmaAutomationActionAdapter','SigmaAutomationEngine','SigmaAutomationTemplates','SigmaAutomationNotifications','SigmaAutomationEventBridge','SigmaAutomationStudioUI'];
    const missing=required.filter(k=>!g[k]);
    return{ok:missing.length===0,missing};
  }};
})(window);

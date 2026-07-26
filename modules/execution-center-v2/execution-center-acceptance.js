(function(g){
  g.SigmaExecutionCenterAcceptance={validate(){
    const required=['SigmaExecutionRequest','SigmaApprovalPolicy','SigmaApprovalQueue','SigmaDraftGenerator','SigmaExecutionAudit','SigmaExecutionResults','SigmaSafeActionAdapter','SigmaExecutionEngine','SigmaApprovalUI','SigmaActionExecutionBridge'];
    const missing=required.filter(k=>!g[k]);
    return{ok:missing.length===0,missing};
  }};
})(window);

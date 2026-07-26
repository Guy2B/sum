(function(g){
  function build(action,label,payload={}){
    if(!action?.id)throw new Error('action id required');
    return {
      id:`exec:${action.id}:${Date.now()}`,
      actionId:action.id,
      sourceId:action.sourceId||null,
      provider:action.provider||'unknown',
      operation:label,
      payload:{...payload},
      risk:classifyRisk(label,action),
      status:'pending',
      requestedAt:new Date().toISOString()
    };
  }
  function classifyRisk(label,action){
    if(['Répondre','Contacter'].includes(label))return 'medium';
    if(['Créer une tâche','Planifier','Reporter','Ignorer'].includes(label))return 'low';
    if(action.priority?.level==='critical')return 'medium';
    return 'low';
  }
  g.SigmaExecutionRequest={build,classifyRisk};
})(window);

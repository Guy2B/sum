(function(g){
  const KEY='sigma-execution-policy-v2';
  const defaults={requireApprovalFor:['Répondre','Contacter'],autoApprove:['Créer une tâche','Planifier','Reporter','Ignorer']};
  function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{return {...defaults};}}
  function save(policy){localStorage.setItem(KEY,JSON.stringify(policy));return policy;}
  function evaluate(request){
    const policy=load();
    if(request.risk==='high')return{decision:'approval-required',reason:'risque élevé'};
    if(policy.requireApprovalFor.includes(request.operation))return{decision:'approval-required',reason:'politique utilisateur'};
    if(policy.autoApprove.includes(request.operation))return{decision:'approved',reason:'action autorisée'};
    return{decision:'approval-required',reason:'action non classée'};
  }
  g.SigmaApprovalPolicy={load,save,evaluate};
})(window);

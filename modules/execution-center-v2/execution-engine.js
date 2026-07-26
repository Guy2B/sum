(function(g){
  function submit(action,operation,payload={}){
    const request=window.SigmaExecutionRequest.build(action,operation,payload);
    const policy=window.SigmaApprovalPolicy.evaluate(request);
    window.SigmaExecutionAudit.record({type:'request-created',requestId:request.id,actionId:action.id,operation,policy});
    if(policy.decision==='approval-required'){
      window.SigmaApprovalQueue.enqueue(request);
      window.dispatchEvent(new CustomEvent('sigma:approval-queue-updated',{detail:window.SigmaApprovalQueue.pending()}));
      return{ok:true,status:'pending-approval',request};
    }
    return executeApproved(action,{...request,status:'approved'});
  }
  function executeApproved(action,request){
    const result=window.SigmaSafeActionAdapter.execute(action,request);
    const finalResult={requestId:request.id,actionId:action.id,operation:request.operation,ok:Boolean(result.ok),result,at:new Date().toISOString()};
    window.SigmaExecutionResults.add(finalResult);
    window.SigmaExecutionAudit.record({type:'execution-completed',...finalResult});
    if(result.ok)window.SigmaActionState?.update?.(action.id,{state:'done'});
    window.dispatchEvent(new CustomEvent('sigma:execution-completed',{detail:finalResult}));
    return{ok:result.ok,status:result.ok?'completed':'failed',request,result};
  }
  function approve(requestId){
    const request=window.SigmaApprovalQueue.list().find(x=>x.id===requestId);
    if(!request)return{ok:false,error:'Demande introuvable'};
    const action=window.SigmaActionState.load().actions.find(x=>x.id===request.actionId);
    if(!action)return{ok:false,error:'Action introuvable'};
    window.SigmaApprovalQueue.update(requestId,{status:'approved',approvedAt:new Date().toISOString()});
    window.SigmaExecutionAudit.record({type:'request-approved',requestId,actionId:action.id});
    return executeApproved(action,{...request,status:'approved'});
  }
  function reject(requestId,reason='Refus utilisateur'){
    const request=window.SigmaApprovalQueue.list().find(x=>x.id===requestId);
    if(!request)return{ok:false,error:'Demande introuvable'};
    window.SigmaApprovalQueue.update(requestId,{status:'rejected',rejectedAt:new Date().toISOString(),reason});
    window.SigmaExecutionAudit.record({type:'request-rejected',requestId,reason});
    window.dispatchEvent(new CustomEvent('sigma:approval-queue-updated',{detail:window.SigmaApprovalQueue.pending()}));
    return{ok:true,status:'rejected'};
  }
  g.SigmaExecutionEngine={submit,approve,reject};
})(window);

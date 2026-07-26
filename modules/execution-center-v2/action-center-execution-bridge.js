(function(g){
  function patch(){
    if(!window.SigmaActionCenter||window.SigmaActionCenter.__executionPatched)return;
    const original=window.SigmaActionCenter.decide;
    window.SigmaActionCenter.decide=function(actionId,label){
      const action=window.SigmaActionState.load().actions.find(x=>x.id===actionId);
      if(!action)return{ok:false,error:'Action introuvable'};
      const result=window.SigmaExecutionEngine.submit(action,label);
      window.SigmaDecisionHistory.record({actionId,label,result,sourceId:action.sourceId});
      window.SigmaActionCenter.rebuild();
      return result;
    };
    window.SigmaActionCenter.__executionPatched=true;
    window.SigmaActionCenter.__legacyDecide=original;
  }
  function boot(){patch();window.addEventListener('sigma:action-center-updated',patch);}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,450),{once:true}):setTimeout(boot,450);
  g.SigmaActionExecutionBridge={patch};
})(window);

(function(g){
  async function execute(rule,context){
    switch(rule.action?.type){
      case 'rebuild-command-center':
        return{ok:true,result:window.SigmaCommandCenter?.rebuild?.()||null,message:'Command Center reconstruit'};
      case 'refresh-command-center':
        return{ok:true,result:await window.SigmaCommandCenter?.refreshAll?.(),message:'Actualisation complète terminée'};
      case 'approval-reminder':{
        const pending=window.SigmaApprovalQueue?.pending?.()||[];
        window.dispatchEvent(new CustomEvent('sigma:automation-reminder',{detail:{type:'approval',count:pending.length}}));
        return{ok:true,count:pending.length,message:`${pending.length} approbation(s) en attente`};
      }
      case 'scan-stale-actions':{
        const actions=window.SigmaActionState?.load?.().actions||[];
        const stale=window.SigmaStaleDetector?.detect?.(actions)||[];
        window.dispatchEvent(new CustomEvent('sigma:automation-reminder',{detail:{type:'stale',count:stale.length}}));
        return{ok:true,count:stale.length,message:`${stale.length} action(s) en retard`};
      }
      case 'create-task-from-focus':{
        const top=context.snapshot?.today?.[0];
        if(!top)return{ok:false,error:'Aucun focus disponible'};
        return window.SigmaSafeActionAdapter?.execute?.(top,{operation:'Créer une tâche'})||{ok:false,error:'Adaptateur indisponible'};
      }
      default:return{ok:false,error:`Action inconnue : ${rule.action?.type}`};
    }
  }
  g.SigmaAutomationActionAdapter={execute};
})(window);

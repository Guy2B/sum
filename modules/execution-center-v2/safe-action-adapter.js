(function(g){
  function createTask(action,request){
    if(window.SigmaApp?.dispatch){
      window.SigmaApp.dispatch({type:'TASK_CREATE',payload:{title:action.title,notes:action.summary,priority:action.priority?.level,sourceUrl:action.url}});
      return{ok:true,mode:'sigma-app',message:'Tâche créée'};
    }
    return{ok:false,error:'Création de tâche indisponible'};
  }
  function plan(action,request){
    window.SigmaActionState?.update?.(action.id,{state:'planned'});
    return{ok:true,mode:'local',message:'Action planifiée'};
  }
  function snooze(action){
    window.SigmaActionState?.update?.(action.id,{state:'snoozed'});
    return{ok:true,mode:'local',message:'Action reportée'};
  }
  function ignore(action){
    window.SigmaActionState?.update?.(action.id,{state:'ignored'});
    return{ok:true,mode:'local',message:'Action ignorée'};
  }
  function openDraft(action,request){
    const draft=window.SigmaDraftGenerator.generate(action,request.operation);
    const encodedSubject=encodeURIComponent(draft.subject);
    const encodedBody=encodeURIComponent(draft.body);
    if(action.provider==='gmail'||action.provider==='mail'){
      window.open(`mailto:?subject=${encodedSubject}&body=${encodedBody}`,'_blank');
      return{ok:true,mode:'mailto',draft};
    }
    if(action.url){
      window.open(action.url,'_blank','noopener');
      return{ok:true,mode:'source',draft};
    }
    return{ok:false,error:'Aucune destination disponible',draft};
  }
  function execute(action,request){
    switch(request.operation){
      case 'Créer une tâche': return createTask(action,request);
      case 'Planifier': return plan(action,request);
      case 'Reporter': return snooze(action);
      case 'Ignorer': return ignore(action);
      case 'Répondre':
      case 'Contacter': return openDraft(action,request);
      default:return{ok:false,error:`Opération non prise en charge : ${request.operation}`};
    }
  }
  g.SigmaSafeActionAdapter={execute};
})(window);

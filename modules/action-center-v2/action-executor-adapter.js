(function(g){
  function createTask(action){
    const app=window.SigmaApp;
    if(app?.dispatch){
      app.dispatch({type:'TASK_CREATE',payload:{title:action.title,notes:action.summary,sourceUrl:action.url,priority:action.priority?.level}});
      return {ok:true,mode:'sigma-app'};
    }
    return {ok:false,error:'Création de tâche non disponible'};
  }
  function openSource(action){
    if(action.url){window.open(action.url,'_blank','noopener');return{ok:true};}
    return {ok:false,error:'Lien source absent'};
  }
  function execute(action,label){
    if(label==='Créer une tâche')return createTask(action);
    if(['Répondre','Contacter','Examiner','Traiter maintenant'].includes(label))return openSource(action);
    if(label==='Ignorer'){window.SigmaActionState.update(action.id,{state:'ignored'});return{ok:true};}
    if(label==='Reporter'){window.SigmaActionState.update(action.id,{state:'snoozed'});return{ok:true};}
    if(label==='Planifier'){window.SigmaActionState.update(action.id,{state:'planned'});return{ok:true};}
    return {ok:false,error:`Action inconnue : ${label}`};
  }
  g.SigmaActionExecutor={execute};
})(window);

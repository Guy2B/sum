(function(g){
  function recommend(context={}){
    const out=[];
    if(context.schoolAssessment?.alerts?.length)out.push({area:'school',priority:'high',title:'Sécuriser la semaine scolaire',actions:window.SigmaSchoolSupportEngineV3.nextActions(context.schoolInput||{})});
    if(context.careLoad?.overloaded)out.push({area:'care',priority:'high',title:'Rééquilibrer la charge familiale',actions:['Réattribuer les tâches non assignées','Reporter une tâche non urgente']});
    if(context.jobFollowups?.length)out.push({area:'career',priority:'medium',title:'Protéger les relances professionnelles',actions:context.jobFollowups.slice(0,3).map(window.SigmaApplicationFollowupEngineV3.message)});
    if(!out.length)out.push({area:'balance',priority:'low',title:'La coordination est stable',actions:['Conserver un point de revue hebdomadaire']});
    return out;
  }
  g.SigmaSupportRecommendationEngineV3={recommend};
})(window);

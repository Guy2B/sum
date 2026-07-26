(function(g){
  const labels={
    communication:['Répondre','Créer une tâche','Reporter','Ignorer'],
    risk:['Traiter maintenant','Créer une tâche','Planifier','Ignorer'],
    opportunity:['Contacter','Créer une tâche','Planifier','Ignorer'],
    calendar:['Planifier','Créer une tâche','Reporter','Ignorer'],
    review:['Examiner','Créer une tâche','Reporter','Ignorer']
  };
  function suggest(action){
    const category=window.SigmaActionClassifier.classify(action);
    return {category,actions:(labels[category]||labels.review).map((label,index)=>({id:`${category}:${index}`,label}))};
  }
  g.SigmaActionSuggestions={suggest};
})(window);

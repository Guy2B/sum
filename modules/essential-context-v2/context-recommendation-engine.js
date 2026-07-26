(function(g){
  function recommend(context){
    const profiles=context.lifeProfiles||[];
    const active=new Set(context.activeSupports||[]);
    const rec=[];
    const add=(id,reason)=>{if(!active.has(id)&&!rec.some(x=>x.id===id))rec.push({id,reason,support:window.SigmaSupportCatalog.find(id)});};
    if(profiles.includes('parent')){add('family-organization','Profil parent détecté');add('school-primary','Accompagnement scolaire possible');}
    if(profiles.includes('student')){add('homework','Profil étudiant détecté');add('exam-prep','Préparation structurée possible');}
    if(profiles.includes('job-seeker')){add('job-search','Recherche d’emploi active');add('application-tracking','Suivi des candidatures recommandé');add('interview-prep','Préparation aux entretiens recommandée');}
    if(profiles.includes('entrepreneur'))add('administrative','Organisation administrative recommandée');
    return rec.filter(x=>x.support);
  }
  g.SigmaContextRecommendations={recommend};
})(window);

(function(g){
  function snapshot(){
    const context=window.SigmaContextProfileStore?.get?.()||window.SigmaContextProfileStore?.load?.()||{};
    const profiles=window.SigmaLifeProfileCatalog?.list?.()||[];
    const calendars=window.SigmaExternalCalendars?.list?.()||[];
    const events=window.SigmaExternalEventStoreV3?.upcoming?.(new Date(),14)||[];
    const milestones=window.SigmaMilestonesV3?.upcoming?.(60)||[];
    const jobs=window.SigmaJobSearchPipelineV3?.list?.()||[];
    const support=window.SigmaSupportPlansV3?.list?.()||[];
    const journey=window.SigmaJourneyUnifierV4?.all?.().slice(0,20)||[];
    return{context,profiles,calendars,events,milestones,jobs,support,journey,generatedAt:new Date().toISOString()};
  }
  function explainSources(data=snapshot()){
    const counts={
      contexte:Object.keys(data.context||{}).length,
      calendriers:data.calendars.length,
      événements:data.events.length,
      étapes:data.milestones.length,
      candidatures:data.jobs.length,
      accompagnements:data.support.length,
      parcours:data.journey.length
    };
    return Object.entries(counts).filter(([,n])=>n>0).map(([label,n])=>`${n} ${label}`).join(' · ')||'Aucune source personnelle disponible';
  }
  function recommendations(data=snapshot()){
    const out=[];
    if(data.events.length>8)out.push({priority:'high',title:'Protéger votre capacité',reason:'Votre calendrier des 14 prochains jours est chargé.'});
    if(data.milestones.length)out.push({priority:'medium',title:'Préparer la prochaine étape',reason:`${data.milestones[0].title||'Une étape importante'} approche.`});
    if(data.jobs.some(x=>x.stage==='interview'))out.push({priority:'medium',title:'Préparer vos entretiens',reason:'Une candidature est actuellement au stade entretien.'});
    if(!out.length)out.push({priority:'low',title:'Maintenir le cap',reason:'Aucun signal urgent n’est détecté dans les sources disponibles.'});
    return out;
  }
  g.SigmaCoachContextBridgeV4={snapshot,explainSources,recommendations};
})(window);

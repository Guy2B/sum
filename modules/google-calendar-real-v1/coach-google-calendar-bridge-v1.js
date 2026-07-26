(function(g){
  function snapshot(){
    const sync=window.SigmaGoogleCalendarSyncV1?.status?.()||{};
    const events=window.SigmaCalendarConflictAdapterV1?.upcoming?.(14)||[];
    const conflicts=window.SigmaCalendarConflictAdapterV1?.conflicts?.()||[];
    return{provider:'google-calendar',authenticated:window.SigmaGoogleAuthSessionV1?.status?.().authenticated||false,sync,events,conflicts};
  }
  function recommendations(){
    const data=snapshot(),out=[];
    if(!data.authenticated)return[{priority:'medium',title:'Connecter Google Calendar',reason:'Le Coach ne peut pas encore lire votre calendrier réel.'}];
    if(data.conflicts.length)out.push({priority:'high',title:'Résoudre un conflit réel',reason:`${data.conflicts.length} chevauchement(s) détecté(s) dans Google Calendar.`});
    if(data.events.length>12)out.push({priority:'medium',title:'Alléger les 14 prochains jours',reason:`${data.events.length} événements sont prévus.`});
    if(!out.length)out.push({priority:'low',title:'Calendrier sous contrôle',reason:'Aucun conflit important n’est détecté.'});
    return out;
  }
  g.SigmaCoachGoogleCalendarBridgeV1={snapshot,recommendations};
})(window);

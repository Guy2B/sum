(function(g){
  function snapshot(){
    const sync=window.SigmaGmailSyncV1?.status?.()||{};
    const ranked=window.SigmaGmailPriorityEngineV1?.ranked?.()||[];
    const actions=window.SigmaGmailActionExtractorV1?.all?.()||[];
    return{
      provider:'gmail',
      authenticated:window.SigmaGmailAuthSessionV1?.status?.().authenticated||false,
      sync,unread:ranked.filter(x=>x.unread).length,
      highPriority:ranked.filter(x=>x.priority==='high').length,
      messages:ranked.slice(0,20),actions
    };
  }
  function recommendations(){
    const data=snapshot(),out=[];
    if(!data.authenticated)return[{priority:'medium',title:'Connecter Gmail',reason:'Le Coach ne peut pas encore analyser vos courriels réels.'}];
    if(data.highPriority)out.push({priority:'high',title:'Traiter les courriels prioritaires',reason:`${data.highPriority} message(s) réel(s) demandent probablement votre attention.`});
    if(data.actions.length)out.push({priority:'medium',title:'Transformer les messages en actions',reason:`${data.actions.length} action(s) potentielle(s) ont été détectées.`});
    if(!out.length)out.push({priority:'low',title:'Boîte courriel sous contrôle',reason:'Aucun signal prioritaire important n’est détecté.'});
    return out;
  }
  g.SigmaCoachGmailBridgeV1={snapshot,recommendations};
})(window);

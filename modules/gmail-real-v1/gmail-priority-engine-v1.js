(function(g){
  const urgent=/urgent|asap|immédiat|important|deadline|échéance|action requise|response needed/i;
  const finance=/invoice|facture|payment|paiement|receipt|reçu/i;
  const calendar=/meeting|réunion|appointment|rendez-vous|calendar|agenda/i;
  function score(message){
    let value=0,reasons=[];
    if(message.unread){value+=20;reasons.push('non lu');}
    if(message.starred){value+=25;reasons.push('étoilé');}
    if(urgent.test(`${message.subject} ${message.snippet}`)){value+=35;reasons.push('langage urgent');}
    if(finance.test(`${message.subject} ${message.snippet}`)){value+=15;reasons.push('finance');}
    if(calendar.test(`${message.subject} ${message.snippet}`)){value+=10;reasons.push('agenda');}
    const age=(Date.now()-new Date(message.internalDate||message.date||0).getTime())/86400000;
    if(age<=2){value+=10;reasons.push('récent');}
    return{...message,priorityScore:Math.min(value,100),priority:value>=60?'high':value>=30?'medium':'low',reasons};
  }
  function ranked(){
    return (window.SigmaGmailStoreV1?.list?.()||[]).map(score).sort((a,b)=>b.priorityScore-a.priorityScore);
  }
  g.SigmaGmailPriorityEngineV1={score,ranked};
})(window);

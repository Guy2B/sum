(function(g){
  const patterns=[
    {type:'reply',re:/please reply|merci de répondre|répondre avant|response required/i},
    {type:'deadline',re:/before\s+\w+|avant le|deadline|échéance/i},
    {type:'payment',re:/invoice|facture|payment due|paiement requis/i},
    {type:'meeting',re:/meeting|réunion|appointment|rendez-vous/i}
  ];
  function extract(message){
    const text=`${message.subject||''}\n${message.snippet||''}\n${message.body||''}`.slice(0,5000);
    return patterns.filter(x=>x.re.test(text)).map(x=>({
      id:`gmail:${message.id}:${x.type}`,type:x.type,
      title:`${x.type}: ${message.subject||'(Sans objet)'}`,
      sourceMessageId:message.id,sourceThreadId:message.threadId,
      confidence:'medium',status:'proposed'
    }));
  }
  function all(){return(window.SigmaGmailStoreV1?.list?.()||[]).flatMap(extract);}
  g.SigmaGmailActionExtractorV1={extract,all};
})(window);

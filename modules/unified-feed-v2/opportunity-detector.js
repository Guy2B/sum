(function(g){
  const patterns=[
    ['reply','réponse attendue',x=>x.needsReply],
    ['reputation','mention ou commentaire',x=>/mention|comment|avis|review/i.test(`${x.type} ${x.text}`)],
    ['business','opportunité commerciale',x=>/client|devis|contrat|partenariat|opportunit/i.test(`${x.title} ${x.text}`)],
    ['deadline','échéance détectée',x=>/deadline|échéance|avant le|due|today|aujourd/i.test(`${x.title} ${x.text}`)]
  ];
  function detect(item){return patterns.filter(([, ,fn])=>fn(item)).map(([type,label])=>({type,label}));}
  g.SigmaUnifiedFeedOpportunity={detect};
})(window);

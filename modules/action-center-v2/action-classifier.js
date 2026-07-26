(function(g){
  function classify(action){
    const text=`${action.title} ${action.summary}`.toLowerCase();
    if(action.type==='reply'||/répondre|reply|commentaire|message/.test(text)) return 'communication';
    if(/échéance|deadline|retard|risque|erreur/.test(text)) return 'risk';
    if(/client|devis|contrat|partenariat|opportunité/.test(text)) return 'opportunity';
    if(/réunion|meeting|calendrier|planifier/.test(text)) return 'calendar';
    return 'review';
  }
  g.SigmaActionClassifier={classify};
})(window);

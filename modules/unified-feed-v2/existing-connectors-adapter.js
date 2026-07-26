(function(g){
  function mail(state){return (state.mailMessages||[]).map(x=>window.SigmaUnifiedFeedNormalizer.normalize({...x,type:'mail'},x.provider||'mail'));}
  function social(state){
    const legacy=(state.socialInteractions||[]).map(x=>window.SigmaUnifiedFeedNormalizer.normalize(x,x.provider||'social'));
    const engine=window.SigmaSocialEngine?.snapshot?.()||{};
    const rows=[...(engine.posts||[]),...(engine.messages||[]),...(engine.comments||[]),...(engine.notifications||[])];
    return [...legacy,...rows.map(x=>window.SigmaUnifiedFeedNormalizer.normalize(x,x.provider||'social'))];
  }
  function accounts(state){
    const social=window.SigmaSocialEngine?.snapshot?.().accounts||[];
    return [...(state.mailAccounts||[]),...(state.socialAccounts||[]),...social];
  }
  g.SigmaExistingConnectorsAdapter={mail,social,accounts};
})(window);

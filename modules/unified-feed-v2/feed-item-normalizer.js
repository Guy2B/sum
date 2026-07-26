(function(g){
  function date(v){const d=new Date(v||Date.now());return Number.isNaN(d.getTime())?new Date().toISOString():d.toISOString();}
  function normalize(input,source){
    const id=input.id||input.externalId||input.url||`${source}:${input.title||input.subject||Date.now()}`;
    return {
      id:String(id), source, type:input.type||'publication',
      title:input.title||input.subject||'(sans titre)',
      text:input.text||input.body||input.snippet||input.content||'',
      author:input.author||input.sender||input.from?.name||input.from?.address||'',
      url:input.url||input.sourceUrl||input.permalink||'',
      publishedAt:date(input.publishedAt||input.receivedAt||input.createdAt),
      unread:Boolean(input.unread), needsReply:Boolean(input.needsReply),
      engagement:Number(input.engagement||input.commentsCount||input.likeCount||0),
      provider:input.provider||source, raw:input
    };
  }
  g.SigmaUnifiedFeedNormalizer={normalize};
})(window);

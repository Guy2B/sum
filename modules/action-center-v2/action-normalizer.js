(function(g){
  function fromFeed(item){
    const opportunity=(item.opportunities||[])[0]||null;
    const type=item.needsReply?'reply':opportunity?.type||'review';
    return {
      id:`action:${item.provider}:${item.id}`,
      sourceId:item.id,
      provider:item.provider||item.source||'unknown',
      type,
      title:item.needsReply?`Répondre : ${item.title}`:item.title,
      summary:item.text||'',
      url:item.url||'',
      author:item.author||'',
      priority:item.priority||{score:0,level:'low',reasons:[]},
      dueAt:item.dueAt||null,
      projectId:item.entities?.find(x=>x.kind==='project')?.id||null,
      contact:item.author||null,
      reasons:[...(item.priority?.reasons||[]),...(item.opportunities||[]).map(x=>x.label)],
      state:'open',
      createdAt:new Date().toISOString(),
      source:item
    };
  }
  g.SigmaActionNormalizer={fromFeed};
})(window);

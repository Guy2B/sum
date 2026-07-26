(function(g){
  function tokens(v){return String(v||'').toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)||[];}
  function link(item,state){
    const hay=tokens(`${item.title} ${item.text}`);
    const entities=[];
    for(const [kind,list] of [['project',state.projects||[]],['goal',state.goals||[]],['task',state.tasks||[]]]){
      for(const entity of list){
        const words=tokens(entity.title||entity.name);
        if(words.some(w=>hay.includes(w))) entities.push({kind,id:entity.id,label:entity.title||entity.name});
      }
    }
    return {...item,entities};
  }
  g.SigmaUnifiedFeedContext={link};
})(window);

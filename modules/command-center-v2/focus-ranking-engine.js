(function(g){
  function rank(actions){
    return [...actions].map(x=>{
      const score=(x.priority?.score||0)+(x.state==='open'?3:0)+(x.needsReply?2:0)+(x.dueAt?2:0);
      return {...x,focusScore:score};
    }).sort((a,b)=>b.focusScore-a.focusScore);
  }
  g.SigmaFocusRanking={rank};
})(window);

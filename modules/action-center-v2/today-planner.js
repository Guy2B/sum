(function(g){
  function today(actions){
    return actions.filter(x=>x.state==='open').sort((a,b)=>{
      const dueA=a.dueAt?new Date(a.dueAt).getTime():Infinity;
      const dueB=b.dueAt?new Date(b.dueAt).getTime():Infinity;
      if(dueA!==dueB)return dueA-dueB;
      return (b.priority?.score||0)-(a.priority?.score||0);
    }).slice(0,12);
  }
  g.SigmaTodayPlanner={today};
})(window);

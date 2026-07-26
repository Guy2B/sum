(function(g){
  function interval(x){const start=new Date(x.start||x.startAt);const end=new Date(x.end||x.endAt||start.getTime()+3600000);return{start,end};}
  function conflicts(events,commitments){
    const out=[];
    for(const event of events||[])for(const commitment of commitments||[]){
      const a=interval(event),b=interval(commitment);
      if(a.start<b.end&&a.end>b.start)out.push({event,commitment,severity:(Math.min(a.end,b.end)-Math.max(a.start,b.start))/60000>=60?'high':'medium'});
    }
    return out;
  }
  function summary(rows){return{total:rows.length,high:rows.filter(x=>x.severity==='high').length,medium:rows.filter(x=>x.severity==='medium').length};}
  g.SigmaCommitmentConflictEngineV3={conflicts,summary};
})(window);

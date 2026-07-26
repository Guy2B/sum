(function(g){
  const mapping={
    tasks:'tasks',
    calendar:'events',
    journey:'journey',
    applications:'applications'
  };
  function plan(){
    const inventory=window.SigmaLocalStorageInventoryV1?.scan?.()||[];
    const grouped={};
    for(const row of inventory){
      const target=mapping[row.category]||'activity';
      (grouped[target]??=[]).push(row);
    }
    return Object.entries(grouped).map(([target,rows])=>({
      targetCollection:target,
      sourceKeys:rows.map(x=>x.key),
      bytes:rows.reduce((s,x)=>s+x.bytes,0),
      status:'planned',
      destructive:false
    }));
  }
  function estimate(){
    const rows=plan();
    return{groups:rows.length,keys:rows.reduce((s,x)=>s+x.sourceKeys.length,0),bytes:rows.reduce((s,x)=>s+x.bytes,0),rows};
  }
  g.SigmaMigrationPlannerV1={plan,estimate};
})(window);

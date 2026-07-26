(function(g){
  const KEY='sigma-action-center-history-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function record(entry){
    const rows=list();
    rows.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),...entry});
    localStorage.setItem(KEY,JSON.stringify(rows.slice(0,500)));
    return rows[0];
  }
  function clear(){localStorage.removeItem(KEY);}
  g.SigmaDecisionHistory={list,record,clear};
})(window);

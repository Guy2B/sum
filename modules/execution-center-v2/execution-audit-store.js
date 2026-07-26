(function(g){
  const KEY='sigma-execution-audit-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function record(event){
    const rows=list();
    rows.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),...event});
    localStorage.setItem(KEY,JSON.stringify(rows.slice(0,1000)));
    return rows[0];
  }
  g.SigmaExecutionAudit={list,record};
})(window);

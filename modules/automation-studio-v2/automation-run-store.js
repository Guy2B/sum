(function(g){
  const KEY='sigma-automation-runs-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function record(run){const rows=list();rows.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),...run});localStorage.setItem(KEY,JSON.stringify(rows.slice(0,1000)));return rows[0];}
  g.SigmaAutomationRuns={list,record};
})(window);

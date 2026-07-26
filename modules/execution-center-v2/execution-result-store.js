(function(g){
  const KEY='sigma-execution-results-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function add(result){const rows=list();rows.unshift(result);localStorage.setItem(KEY,JSON.stringify(rows.slice(0,500)));return result;}
  g.SigmaExecutionResults={list,add};
})(window);

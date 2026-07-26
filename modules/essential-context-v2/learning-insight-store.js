(function(g){
  const KEY='sigma-learning-insights-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function propose(insight){const rows=list();const row={id:crypto.randomUUID(),status:'proposed',createdAt:new Date().toISOString(),...insight};rows.unshift(row);localStorage.setItem(KEY,JSON.stringify(rows));return row;}
  function setStatus(id,status){const rows=list().map(x=>x.id===id?{...x,status,updatedAt:new Date().toISOString()}:x);localStorage.setItem(KEY,JSON.stringify(rows));return rows;}
  g.SigmaLearningInsights={list,propose,setStatus};
})(window);

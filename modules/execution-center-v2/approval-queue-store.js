(function(g){
  const KEY='sigma-approval-queue-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));return rows;}
  function enqueue(request){const rows=list();rows.unshift(request);return save(rows).find(x=>x.id===request.id);}
  function update(id,patch){return save(list().map(x=>x.id===id?{...x,...patch,updatedAt:new Date().toISOString()}:x));}
  function pending(){return list().filter(x=>x.status==='pending');}
  g.SigmaApprovalQueue={list,enqueue,update,pending};
})(window);

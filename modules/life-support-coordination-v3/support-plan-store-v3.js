(function(g){
  const KEY='sigma-support-plans-v3';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:support-plans-updated',{detail:rows}));return rows;}
  function add(plan){const rows=list();const next={id:crypto.randomUUID(),status:'active',tasks:[],checkIns:[],createdAt:new Date().toISOString(),...plan};rows.push(next);save(rows);return next;}
  function update(id,patch){return save(list().map(x=>x.id===id?{...x,...patch,updatedAt:new Date().toISOString()}:x));}
  function addTask(id,task){return save(list().map(x=>x.id===id?{...x,tasks:[...(x.tasks||[]),{id:crypto.randomUUID(),done:false,...task}]}:x));}
  function toggleTask(planId,taskId){return save(list().map(x=>x.id===planId?{...x,tasks:(x.tasks||[]).map(t=>t.id===taskId?{...t,done:!t.done}:t)}:x));}
  g.SigmaSupportPlansV3={list,save,add,update,addTask,toggleTask};
})(window);

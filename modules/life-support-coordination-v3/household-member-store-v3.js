(function(g){
  const KEY='sigma-household-members-v3';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:household-members-updated',{detail:rows}));return rows;}
  function add(member){const rows=list();const next={id:crypto.randomUUID(),role:'member',supportNeeds:[],createdAt:new Date().toISOString(),...member};rows.push(next);save(rows);return next;}
  function update(id,patch){return save(list().map(x=>x.id===id?{...x,...patch,updatedAt:new Date().toISOString()}:x));}
  function remove(id){return save(list().filter(x=>x.id!==id));}
  function byRole(role){return list().filter(x=>x.role===role);}
  g.SigmaHouseholdMembersV3={list,save,add,update,remove,byRole};
})(window);

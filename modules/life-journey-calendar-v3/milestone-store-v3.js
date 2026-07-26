(function(g){
  const KEY='sigma-life-milestones-v3';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:milestones-updated',{detail:rows}));return rows;}
  function add(item){const rows=list();const next={id:crypto.randomUUID(),type:'life',status:'planned',createdAt:new Date().toISOString(),...item};rows.push(next);save(rows);return next;}
  function update(id,patch){return save(list().map(x=>x.id===id?{...x,...patch,updatedAt:new Date().toISOString()}:x));}
  function upcoming(days=90){const now=new Date(),end=new Date();end.setDate(end.getDate()+days);return list().filter(x=>{const d=new Date(x.date);return d>=now&&d<=end;}).sort((a,b)=>String(a.date).localeCompare(String(b.date)));}
  g.SigmaMilestonesV3={list,save,add,update,upcoming};
})(window);

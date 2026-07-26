(function(g){
  const KEY='sigma-school-household-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:school-household-updated',{detail:rows}));return rows;}
  function upsert(child){const rows=list();const i=rows.findIndex(x=>x.id===child.id);const next={id:child.id||crypto.randomUUID(),subjects:[],goals:[],difficulties:[],...child};if(i>=0)rows[i]={...rows[i],...next};else rows.push(next);return save(rows);}
  function remove(id){return save(list().filter(x=>x.id!==id));}
  g.SigmaSchoolHousehold={list,save,upsert,remove};
})(window);

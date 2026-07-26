(function(g){
  const KEY='sigma-journey-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function add(entry){const rows=list();rows.unshift({id:crypto.randomUUID(),createdAt:new Date().toISOString(),mood:null,tags:[],...entry});localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:journey-updated',{detail:rows}));return rows[0];}
  function remove(id){const rows=list().filter(x=>x.id!==id);localStorage.setItem(KEY,JSON.stringify(rows));return rows;}
  g.SigmaJourney={list,add,remove};
})(window);

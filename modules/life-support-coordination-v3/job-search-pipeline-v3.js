(function(g){
  const KEY='sigma-job-search-pipeline-v3';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:job-pipeline-updated',{detail:rows}));return rows;}
  function add(item){const rows=list();const next={id:crypto.randomUUID(),stage:'target',createdAt:new Date().toISOString(),history:[],...item};rows.push(next);save(rows);return next;}
  function move(id,stage){return save(list().map(x=>x.id===id?{...x,stage,history:[...(x.history||[]),{stage,at:new Date().toISOString()}]}:x));}
  function stats(){const rows=list();const byStage=rows.reduce((a,x)=>(a[x.stage]=(a[x.stage]||0)+1,a),{});return{total:rows.length,byStage,interviews:byStage.interview||0,offers:byStage.offer||0};}
  g.SigmaJobSearchPipelineV3={list,save,add,move,stats};
})(window);

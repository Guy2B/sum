(function(g){
  const KEY='sigma-journey-timeline-v3';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:journey-timeline-updated',{detail:rows}));return rows;}
  function add(entry){const rows=list();const next={id:crypto.randomUUID(),kind:'reflection',date:new Date().toISOString(),tags:[],...entry};rows.unshift(next);save(rows);return next;}
  function linkLearning(journeyId,learningId){return save(list().map(x=>x.id===journeyId?{...x,learningId}:x));}
  function byMonth(){return list().reduce((acc,x)=>{const key=String(x.date).slice(0,7);(acc[key]??=[]).push(x);return acc;},{});}
  g.SigmaJourneyTimelineV3={list,save,add,linkLearning,byMonth};
})(window);

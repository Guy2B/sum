(function(g){
  const KEY='sigma-unified-feed-rss-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));return rows;}
  function add(source){const rows=list().filter(x=>x.url!==source.url);rows.push({id:source.id||crypto.randomUUID(),name:source.name||source.url,url:source.url,enabled:source.enabled!==false});return save(rows);}
  function remove(id){return save(list().filter(x=>x.id!==id));}
  g.SigmaUnifiedFeedRSS={list,add,remove};
})(window);

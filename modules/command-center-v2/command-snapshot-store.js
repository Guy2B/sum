(function(g){
  const KEY='sigma-command-center-snapshot-v2';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch{return null;}}
  function save(value){localStorage.setItem(KEY,JSON.stringify(value));return value;}
  g.SigmaCommandSnapshot={load,save};
})(window);

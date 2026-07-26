(function(g){
  const classifyKey=key=>{
    if(/demo|sample|mock/i.test(key))return'demo';
    if(/calendar|event/i.test(key))return'calendar';
    if(/task|action|plan/i.test(key))return'tasks';
    if(/journal|journey|learning/i.test(key))return'journey';
    if(/job|application/i.test(key))return'applications';
    return'other';
  };
  function scan(storage=localStorage){
    const rows=[];
    for(let i=0;i<storage.length;i++){
      const key=storage.key(i),raw=storage.getItem(key)||'';
      rows.push({key,category:classifyKey(key),bytes:new Blob([raw]).size,looksJson:/^[\[{]/.test(raw.trim()),origin:/demo|sample|mock/i.test(key)?'demo':'local'});
    }
    return rows.sort((a,b)=>b.bytes-a.bytes);
  }
  function summary(){
    const rows=scan();
    return{keys:rows.length,bytes:rows.reduce((s,x)=>s+x.bytes,0),demo:rows.filter(x=>x.origin==='demo').length,rows};
  }
  g.SigmaLocalStorageInventoryV1={scan,summary,classifyKey};
})(window);

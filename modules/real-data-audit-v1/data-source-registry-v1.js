(function(g){
  const KEY='sigma:data-source-registry:v1';
  const DEFAULTS=[
    {id:'tasks',label:'Tâches',origin:'local',storage:'localStorage',sync:'none',freshness:'unknown',confidence:'medium'},
    {id:'calendar',label:'Calendrier',origin:'mixed',storage:'local/Firebase',sync:'manual',freshness:'unknown',confidence:'medium'},
    {id:'journey',label:'Mon parcours',origin:'local',storage:'localStorage',sync:'none',freshness:'unknown',confidence:'medium'},
    {id:'coach',label:'Coach',origin:'derived',storage:'runtime',sync:'on-demand',freshness:'live',confidence:'low'},
    {id:'applications',label:'Candidatures',origin:'local',storage:'localStorage',sync:'none',freshness:'unknown',confidence:'medium'}
  ];
  function read(){
    try{
      const rows=JSON.parse(localStorage.getItem(KEY)||'null');
      return Array.isArray(rows)&&rows.length?rows:DEFAULTS.map(x=>({...x}));
    }catch{return DEFAULTS.map(x=>({...x}));}
  }
  function write(rows){
    localStorage.setItem(KEY,JSON.stringify(rows));
    window.dispatchEvent(new CustomEvent('sigma:data-source-registry-updated',{detail:{count:rows.length}}));
    return rows;
  }
  function list(){return read();}
  function get(id){return read().find(x=>x.id===id)||null;}
  function upsert(record){
    const rows=read(),i=rows.findIndex(x=>x.id===record.id);
    const next={...rows[i],...record,updatedAt:new Date().toISOString()};
    if(i>=0)rows[i]=next;else rows.push(next);
    return write(rows),next;
  }
  function summary(){
    const rows=read();
    return{
      total:rows.length,
      real:rows.filter(x=>x.origin==='real').length,
      local:rows.filter(x=>x.origin==='local').length,
      demo:rows.filter(x=>x.origin==='demo').length,
      mixed:rows.filter(x=>x.origin==='mixed').length,
      derived:rows.filter(x=>x.origin==='derived').length
    };
  }
  g.SigmaDataSourceRegistryV1={KEY,DEFAULTS,list,get,upsert,summary};
})(window);

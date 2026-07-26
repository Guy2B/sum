(function(g){
  function journalRows(){
    try{
      const raw=localStorage.getItem('sum-journal')||localStorage.getItem('sigma-journal')||'[]';
      return JSON.parse(raw).map(x=>({kind:'journal',date:x.date||x.createdAt||new Date().toISOString(),title:x.title||'Réflexion',text:x.text||x.content||'',sourceId:x.id||null}));
    }catch{return[];}
  }
  function learningRows(){
    try{
      const raw=localStorage.getItem('sum-learning')||localStorage.getItem('sigma-learning')||'[]';
      return JSON.parse(raw).map(x=>({kind:'learning',date:x.updatedAt||x.createdAt||new Date().toISOString(),title:x.name||x.title||'Apprentissage',text:x.notes||x.description||'',progress:x.progress??null,sourceId:x.id||null}));
    }catch{return[];}
  }
  function timelineRows(){
    return window.SigmaJourneyTimelineV3?.list?.().map(x=>({...x,kind:x.kind||'journey'}))||[];
  }
  function all(){
    const seen=new Set();
    return [...journalRows(),...learningRows(),...timelineRows()]
      .filter(x=>{const key=[x.kind,x.sourceId,x.date,x.title,x.text].join('|');if(seen.has(key))return false;seen.add(key);return true;})
      .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  }
  function summary(){
    const rows=all();
    return{
      total:rows.length,
      journal:rows.filter(x=>x.kind==='journal'||x.kind==='reflection').length,
      learning:rows.filter(x=>x.kind==='learning').length,
      milestones:rows.filter(x=>x.kind==='milestone').length
    };
  }
  g.SigmaJourneyUnifierV4={journalRows,learningRows,timelineRows,all,summary};
})(window);

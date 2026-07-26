(function(g){
  function due(items,now=new Date()){
    return (items||[]).filter(x=>x.stage!=='rejected'&&x.stage!=='offer').map(x=>{
      const base=new Date(x.lastContactAt||x.appliedAt||x.createdAt);const days=x.stage==='applied'?5:x.stage==='interview'?3:7;
      const dueAt=new Date(base);dueAt.setDate(dueAt.getDate()+days);return{...x,dueAt:dueAt.toISOString(),overdue:dueAt<now};
    }).filter(x=>new Date(x.dueAt)<=new Date(now.getTime()+7*86400000)).sort((a,b)=>String(a.dueAt).localeCompare(String(b.dueAt)));
  }
  function message(item){
    if(item.stage==='interview')return`Relancer ${item.company||'l’entreprise'} après l’entretien.`;
    if(item.stage==='applied')return`Vérifier l’avancement de la candidature ${item.title||''}`.trim();
    return`Reprendre contact avec ${item.company||'ce contact'}.`;
  }
  g.SigmaApplicationFollowupEngineV3={due,message};
})(window);

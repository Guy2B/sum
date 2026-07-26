(function(g){
  function events(){
    return window.SigmaGoogleCalendarStoreV1?.listEvents?.()||[];
  }
  function overlaps(a,b){
    const as=new Date(a.start).getTime(),ae=new Date(a.end).getTime();
    const bs=new Date(b.start).getTime(),be=new Date(b.end).getTime();
    return as<be&&bs<ae;
  }
  function conflicts(){
    const rows=events().filter(x=>x.start&&x.end).sort((a,b)=>String(a.start).localeCompare(String(b.start)));
    const out=[];
    for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
      if(new Date(rows[j].start).getTime()>=new Date(rows[i].end).getTime())break;
      if(overlaps(rows[i],rows[j]))out.push({a:rows[i],b:rows[j],type:'overlap'});
    }
    return out;
  }
  function upcoming(days=14){
    const now=Date.now(),end=now+days*86400000;
    return events().filter(x=>{const t=new Date(x.start).getTime();return t>=now&&t<=end;});
  }
  g.SigmaCalendarConflictAdapterV1={events,overlaps,conflicts,upcoming};
})(window);

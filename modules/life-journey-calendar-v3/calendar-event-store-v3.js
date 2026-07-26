(function(g){
  const KEY='sigma-external-events-v3';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:external-events-updated',{detail:rows}));return rows;}
  function merge(events){
    const map=new Map(list().map(x=>[`${x.calendarId}:${x.externalId||x.id}`,x]));
    for(const event of events||[])map.set(`${event.calendarId}:${event.externalId||event.id}`,{...map.get(`${event.calendarId}:${event.externalId||event.id}`),...event,updatedAt:new Date().toISOString()});
    return save([...map.values()].sort((a,b)=>String(a.start).localeCompare(String(b.start))));
  }
  function removeCalendar(calendarId){return save(list().filter(x=>x.calendarId!==calendarId));}
  function upcoming(from=new Date(),days=30){const end=new Date(from);end.setDate(end.getDate()+days);return list().filter(x=>{const d=new Date(x.start);return d>=from&&d<=end;});}
  g.SigmaExternalEventStoreV3={list,save,merge,removeCalendar,upcoming};
})(window);

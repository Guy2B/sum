(function(g){
  const KEY='sigma-external-calendars-v3';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('sigma:external-calendars-updated',{detail:rows}));return rows;}
  function upsert(calendar){const rows=list();const id=calendar.id||crypto.randomUUID();const next={id,name:'Calendrier externe',provider:'ics',readOnly:true,enabled:true,lastSyncAt:null,eventCount:0,...calendar};const i=rows.findIndex(x=>x.id===id);if(i>=0)rows[i]={...rows[i],...next};else rows.push(next);return save(rows);}
  function remove(id){return save(list().filter(x=>x.id!==id));}
  function toggle(id,enabled){return save(list().map(x=>x.id===id?{...x,enabled:Boolean(enabled)}:x));}
  g.SigmaExternalCalendars={list,save,upsert,remove,toggle};
})(window);

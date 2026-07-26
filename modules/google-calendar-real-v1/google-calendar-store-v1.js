(function(g){
  const KEY='sigma:google-calendar-cache:v1';
  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{"calendars":[],"events":[],"syncedAt":null}');}
    catch{return{calendars:[],events:[],syncedAt:null};}
  }
  function write(value){
    localStorage.setItem(KEY,JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('sigma:google-calendar-store-updated',{detail:{events:value.events.length}}));
    return value;
  }
  function replace(calendars,events){
    const value={calendars,events,syncedAt:new Date().toISOString()};
    write(value);
    window.SigmaDataSourceRegistryV1?.upsert?.({
      id:'calendar',label:'Google Calendar',origin:'real',storage:'Google API + local cache',
      sync:'manual',freshness:'fresh',confidence:'high',lastSyncAt:value.syncedAt
    });
    return value;
  }
  function listEvents(){return read().events||[];}
  function listCalendars(){return read().calendars||[];}
  function clear(){return write({calendars:[],events:[],syncedAt:null});}
  g.SigmaGoogleCalendarStoreV1={KEY,read,replace,listEvents,listCalendars,clear};
})(window);

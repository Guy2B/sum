(function(g){
  const KEY='sigma:gmail-cache:v1';
  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{"profile":null,"messages":[],"syncedAt":null,"query":null}');}
    catch{return{profile:null,messages:[],syncedAt:null,query:null};}
  }
  function write(value){
    localStorage.setItem(KEY,JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('sigma:gmail-store-updated',{detail:{messages:value.messages.length}}));
    return value;
  }
  function replace(profile,messages,query){
    const value={profile,messages,syncedAt:new Date().toISOString(),query};
    write(value);
    window.SigmaDataSourceRegistryV1?.upsert?.({
      id:'gmail',label:'Gmail',origin:'real',storage:'Google API + local cache',
      sync:'manual',freshness:'fresh',confidence:'high',lastSyncAt:value.syncedAt
    });
    return value;
  }
  function list(){return read().messages||[];}
  function clear(){return write({profile:null,messages:[],syncedAt:null,query:null});}
  g.SigmaGmailStoreV1={KEY,read,replace,list,clear};
})(window);

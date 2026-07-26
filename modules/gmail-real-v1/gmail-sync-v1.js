(function(g){
  let running=false,lastError=null;
  async function sync({q='newer_than:30d',maxResults=50}={}){
    if(running)throw new Error('Gmail sync already running');
    running=true;lastError=null;
    try{
      const [profile,result]=await Promise.all([
        window.SigmaGmailClientV1.profile(),
        window.SigmaGmailClientV1.listHydrated({q,maxResults})
      ]);
      const value=window.SigmaGmailStoreV1.replace(profile,result.messages,q);
      window.dispatchEvent(new CustomEvent('sigma:gmail-synced',{detail:{messages:result.messages.length}}));
      return value;
    }catch(e){lastError=e;throw e;}
    finally{running=false;}
  }
  function status(){
    const cache=window.SigmaGmailStoreV1.read();
    return{running,lastError:lastError?String(lastError.message||lastError):null,syncedAt:cache.syncedAt,messages:cache.messages.length,query:cache.query};
  }
  g.SigmaGmailSyncV1={sync,status};
})(window);

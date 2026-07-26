(function(g){
  const KEY='sigma:google-unified-oauth:v1';
  let tokenClient=null,lastToken=null;
  function config(){
    return window.SigmaGoogleCalendarConfigV1?.get?.()||
      window.SigmaGmailConfigV1?.get?.()||
      window.SigmaGoogleConfig?.get?.()||
      {};
  }
  function state(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return{};}
  }
  function save(patch){
    const next={...state(),...patch,updatedAt:new Date().toISOString()};
    localStorage.setItem(KEY,JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('sigma:google-unified-oauth-updated',{detail:next}));
    return next;
  }
  function ready(){
    return Boolean(window.google?.accounts?.oauth2?.initTokenClient&&config().clientId);
  }
  function init(){
    if(tokenClient)return tokenClient;
    if(!ready())throw new Error('Google Identity Services or clientId unavailable');
    const identity=window.SigmaGoogleAccountBridgeV1.identity();
    tokenClient=window.google.accounts.oauth2.initTokenClient({
      client_id:config().clientId,
      scope:'',
      include_granted_scopes:true,
      hint:identity.email||undefined,
      callback:()=>{}
    });
    return tokenClient;
  }
  function request(scopes,{prompt='consent'}={}){
    const client=init();
    return new Promise((resolve,reject)=>{
      client.callback=response=>{
        if(response?.error)return reject(new Error(response.error_description||response.error));
        lastToken=response;
        const expiresAt=Date.now()+Number(response.expires_in||0)*1000;
        save({grantedScope:response.scope||scopes.join(' '),expiresAt,lastAuthorizedAt:new Date().toISOString()});
        resolve(response);
      };
      client.requestAccessToken({scope:scopes.join(' '),prompt});
    });
  }
  function hasValidToken(){return Boolean(lastToken?.access_token&&Number(state().expiresAt||0)>Date.now()+30000);}
  function accessToken(){return lastToken?.access_token||null;}
  function clear(){lastToken=null;localStorage.removeItem(KEY);}
  g.SigmaGoogleUnifiedOAuthV1={KEY,config,state,save,ready,init,request,hasValidToken,accessToken,clear};
})(window);

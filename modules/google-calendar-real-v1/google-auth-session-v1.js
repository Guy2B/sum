(function(g){
  let tokenClient=null;
  let accessToken=null;
  let expiresAt=0;
  let lastError=null;
  async function init(){
    const config=window.SigmaGoogleCalendarConfigV1.read();
    if(!window.SigmaGoogleCalendarConfigV1.ready())throw new Error('Google Calendar configuration is incomplete');
    await window.SigmaGoogleScriptLoaderV1.loadGoogle();
    if(!window.google?.accounts?.oauth2)throw new Error('Google Identity Services is unavailable');
    tokenClient=window.google.accounts.oauth2.initTokenClient({
      client_id:config.clientId,
      scope:config.scopes,
      callback:()=>{}
    });
    return status();
  }
  function requestToken({prompt='consent'}={}){
    if(!tokenClient)return Promise.reject(new Error('Google auth session is not initialized'));
    return new Promise((resolve,reject)=>{
      tokenClient.callback=response=>{
        if(response.error){
          lastError=response;
          return reject(new Error(response.error_description||response.error));
        }
        accessToken=response.access_token;
        expiresAt=Date.now()+((response.expires_in||3600)*1000);
        window.dispatchEvent(new CustomEvent('sigma:google-calendar-authenticated'));
        resolve(status());
      };
      tokenClient.requestAccessToken({prompt});
    });
  }
  function getAccessToken(){
    if(!accessToken||Date.now()>=expiresAt)throw new Error('Google Calendar access token is missing or expired');
    return accessToken;
  }
  function disconnect(){
    const token=accessToken;
    accessToken=null;
    expiresAt=0;
    if(token&&window.google?.accounts?.oauth2?.revoke)window.google.accounts.oauth2.revoke(token,()=>{});
    window.dispatchEvent(new CustomEvent('sigma:google-calendar-disconnected'));
    return status();
  }
  function status(){
    return{
      initialized:Boolean(tokenClient),
      authenticated:Boolean(accessToken&&Date.now()<expiresAt),
      expiresAt:expiresAt?new Date(expiresAt).toISOString():null,
      lastError
    };
  }
  g.SigmaGoogleAuthSessionV1={init,requestToken,getAccessToken,disconnect,status};
})(window);

(function(g){
  let tokenClient=null,accessToken=null,expiresAt=0,lastError=null;
  async function init(){
    const config=window.SigmaGmailConfigV1.read();
    if(!window.SigmaGmailConfigV1.ready())throw new Error('Gmail configuration is incomplete');
    await window.SigmaGoogleScriptLoaderV1.loadGoogle();
    await new Promise((resolve,reject)=>{
      window.gapi.load('client',async()=>{
        try{
          const initConfig={discoveryDocs:[config.discoveryDoc]};
          if(String(config.apiKey||'').trim())initConfig.apiKey=String(config.apiKey).trim();
          await window.gapi.client.init(initConfig);
          await window.gapi.client.load('gmail','v1');
          resolve();
        }catch(e){reject(e);}
      });
    });
    tokenClient=window.google.accounts.oauth2.initTokenClient({
      client_id:config.clientId,
      scope:config.scopes,
      callback:()=>{}
    });
    return status();
  }
  function requestToken({prompt='consent'}={}){
    if(!tokenClient)return Promise.reject(new Error('Gmail auth session is not initialized'));
    return new Promise((resolve,reject)=>{
      tokenClient.callback=response=>{
        if(response.error){lastError=response;return reject(new Error(response.error_description||response.error));}
        accessToken=response.access_token;
        expiresAt=Date.now()+((response.expires_in||3600)*1000);
        window.gapi.client.setToken({access_token:accessToken});
        window.dispatchEvent(new CustomEvent('sigma:gmail-authenticated'));
        resolve(status());
      };
      tokenClient.requestAccessToken({prompt});
    });
  }
  function disconnect(){
    const token=accessToken;accessToken=null;expiresAt=0;
    window.gapi?.client?.setToken?.(null);
    if(token&&window.google?.accounts?.oauth2?.revoke)window.google.accounts.oauth2.revoke(token,()=>{});
    window.dispatchEvent(new CustomEvent('sigma:gmail-disconnected'));
    return status();
  }
  function status(){
    return{initialized:Boolean(tokenClient),authenticated:Boolean(accessToken&&Date.now()<expiresAt),expiresAt:expiresAt?new Date(expiresAt).toISOString():null,lastError};
  }
  g.SigmaGmailAuthSessionV1={init,requestToken,disconnect,status};
})(window);

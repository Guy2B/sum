(function(g){
  const KEY='sigma:gmail-config:v1';
  const defaults={
    clientId:'',
    apiKey:'',
    discoveryDoc:'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
    scopes:'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send',
    enabled:false
  };
  function read(){
    try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}
    catch{return{...defaults};}
  }
  function write(next){
    const value={...read(),...next,updatedAt:new Date().toISOString()};
    localStorage.setItem(KEY,JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('sigma:gmail-config-updated',{detail:{enabled:value.enabled}}));
    return value;
  }
  function ready(){
    const c=read();
    return Boolean(c.enabled&&c.clientId&&c.discoveryDoc&&c.scopes);
  }
  function publicView(){
    const c=read();
    return{...c,clientId:c.clientId?`${c.clientId.slice(0,10)}…`:'',apiKey:c.apiKey?'configured':'missing'};
  }
  g.SigmaGmailConfigV1={KEY,defaults,read,write,ready,publicView};
})(window);

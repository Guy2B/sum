(function(g){
  const KEY='sigma:google-calendar-config:v1';
  const defaults={
    clientId:'',
    apiKey:'',
    discoveryDoc:'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    scopes:'https://www.googleapis.com/auth/calendar',
    redirectMode:'popup',
    enabled:false
  };
  function read(){
    try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}
    catch{return{...defaults};}
  }
  function write(next){
    const value={...read(),...next,updatedAt:new Date().toISOString()};
    localStorage.setItem(KEY,JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('sigma:google-calendar-config-updated',{detail:{enabled:value.enabled}}));
    return value;
  }
  function ready(){
    const c=read();
    return Boolean(c.enabled&&c.clientId&&c.apiKey&&c.discoveryDoc&&c.scopes);
  }
  function publicView(){
    const c=read();
    return{...c,clientId:c.clientId?`${c.clientId.slice(0,10)}…`:'',apiKey:c.apiKey?'configured':'missing'};
  }
  g.SigmaGoogleCalendarConfigV1={KEY,defaults,read,write,ready,publicView};
})(window);

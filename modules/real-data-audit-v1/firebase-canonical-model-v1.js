(function(g){
  const collections={
    user:'users/{uid}',
    tasks:'users/{uid}/tasks/{taskId}',
    events:'users/{uid}/events/{eventId}',
    connections:'users/{uid}/connections/{connectionId}',
    journey:'users/{uid}/journey/{entryId}',
    applications:'users/{uid}/applications/{applicationId}',
    automations:'users/{uid}/automations/{automationId}',
    activity:'users/{uid}/activity/{activityId}'
  };
  const version='1.0.0';
  function path(name,ids={}){
    let value=collections[name];
    if(!value)throw new Error(`Unknown canonical collection: ${name}`);
    for(const [key,id] of Object.entries(ids))value=value.replace(`{${key}}`,String(id));
    return value;
  }
  function validate(){
    const required=['user','tasks','events','connections','journey','applications','automations','activity'];
    const missing=required.filter(x=>!collections[x]);
    return{ok:missing.length===0,missing,version};
  }
  g.SigmaFirebaseCanonicalModelV1={version,collections,path,validate};
})(window);

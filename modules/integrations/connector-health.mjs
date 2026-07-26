export function evaluateConnectorHealth({lastSuccessAt=null,lastError=null,latencyMs=null}={}, {now=Date.now(),staleAfterMs=3600000}={}){
  if(lastError) return {status:'degraded',reason:lastError};
  if(!lastSuccessAt) return {status:'unknown',reason:'never-synced'};
  const age=now-new Date(lastSuccessAt).getTime();
  if(age>staleAfterMs) return {status:'stale',ageMs:age};
  return {status:'healthy',latencyMs};
}

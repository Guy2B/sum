export function validateIntegrationHub(hub){
  const missing=['register','create','list'].filter(key=>typeof hub?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

export function validateIntegrationOrchestrator(orchestrator){
  const required=['register','sync','health','list'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

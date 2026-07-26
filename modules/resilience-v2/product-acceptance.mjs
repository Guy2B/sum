export function validateResilienceOrchestrator(orchestrator){
  const required=['execute','breaker','audit'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

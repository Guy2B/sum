export function validateObservabilityOrchestrator(orchestrator){
  const required=['registerAlert','ingest','evaluateAlerts','snapshot'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

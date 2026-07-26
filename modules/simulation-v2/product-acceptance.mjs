export function validateSimulationOrchestrator(orchestrator){
  const required=['evaluate','audit'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

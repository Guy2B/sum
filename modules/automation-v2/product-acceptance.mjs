export function validateAutomationOrchestrator(orchestrator){
  const required=['register','dispatch','workflows','audit'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

export function validateExecutionOrchestrator(orchestrator){
  const required=['execute','journal'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

export function validateLearningOrchestrator(orchestrator){
  const required=['ingest','profile','behavior','audit'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

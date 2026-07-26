export function validateGovernanceOrchestrator(orchestrator){
  const required=['addPolicy','authorize','protect','audit','verifyAudit'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

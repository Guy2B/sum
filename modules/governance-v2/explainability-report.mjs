export function createExplainabilityReport({
  decision,
  inputs={},
  rules=[],
  evidence=[],
  confidence=null
}={}){
  if(decision===undefined) throw new Error('decision is required');
  return {
    decision:structuredClone(decision),
    inputs:structuredClone(inputs),
    rules:rules.map(rule=>structuredClone(rule)),
    evidence:evidence.map(item=>structuredClone(item)),
    confidence,
    generatedAt:new Date().toISOString()
  };
}

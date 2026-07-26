export function createDecisionRecord({
  id,
  title,
  selectedOption,
  alternatives=[],
  rationale=[],
  evidence=[],
  confidence=null
}={}){
  if(!id||!title||!selectedOption) throw new Error('decision id, title and selectedOption are required');
  return {
    id,
    title,
    selectedOption:structuredClone(selectedOption),
    alternatives:alternatives.map(item=>structuredClone(item)),
    rationale:[...rationale],
    evidence:evidence.map(item=>structuredClone(item)),
    confidence,
    decidedAt:new Date().toISOString()
  };
}

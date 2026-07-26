export function evaluateDecisionPolicy({
  score,
  confidence,
  risk,
  approval=false
}={},{
  minimumScore=0,
  minimumConfidence=0,
  maximumRisk=1,
  requireApproval=false
}={}){
  const reasons=[];
  if((score??0)<minimumScore) reasons.push('score-too-low');
  if((confidence??0)<minimumConfidence) reasons.push('confidence-too-low');
  if((risk??0)>maximumRisk) reasons.push('risk-too-high');
  if(requireApproval&&!approval) reasons.push('approval-required');
  return {accepted:reasons.length===0,reasons};
}

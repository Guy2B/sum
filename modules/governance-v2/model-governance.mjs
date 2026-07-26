export function evaluateModelGovernance(model,{
  approvedProviders=[],
  minimumConfidence=0,
  requireHumanReview=false
}={}){
  const findings=[];
  if(!approvedProviders.includes(model.provider)){
    findings.push({code:'provider-not-approved',severity:'high'});
  }
  if((model.confidence??0)<minimumConfidence){
    findings.push({code:'confidence-too-low',severity:'medium'});
  }
  if(requireHumanReview&&!model.humanReview){
    findings.push({code:'human-review-required',severity:'high'});
  }
  return {approved:findings.length===0,findings};
}

export function evaluateResiliencePolicy({
  service,
  operation,
  risk='low',
  degradedMode=false
}={},{
  blockedServices=[],
  maximumRisk='high',
  allowDegradedMode=true
}={}){
  const rank={low:0,medium:1,high:2,critical:3};
  const reasons=[];

  if(blockedServices.includes(service)) reasons.push('service-blocked');
  if(rank[risk]>rank[maximumRisk]) reasons.push('risk-too-high');
  if(degradedMode&&!allowDegradedMode) reasons.push('degraded-mode-not-allowed');

  return {
    allowed:reasons.length===0,
    reasons,
    service,
    operation
  };
}

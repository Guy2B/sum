export function createChaosScenario({
  id,
  name,
  target,
  fault,
  durationMs=0,
  safeguards=[]
}={}){
  if(!id||!name||!target||!fault) throw new Error('chaos scenario fields are required');
  return {
    id,
    name,
    target,
    fault:structuredClone(fault),
    durationMs,
    safeguards:safeguards.map(item=>structuredClone(item)),
    status:'draft'
  };
}

export function evaluateChaosSafety(scenario,{allowedTargets=[]}={}){
  const reasons=[];
  if(allowedTargets.length&&!allowedTargets.includes(scenario.target)) reasons.push('target-not-allowed');
  if(!scenario.safeguards.length) reasons.push('safeguards-required');
  return {safe:reasons.length===0,reasons};
}

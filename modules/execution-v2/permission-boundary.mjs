export function evaluatePermissionBoundary({
  actor,
  capability,
  resource,
  context={}
}={},{
  allowedCapabilities=[],
  deniedCapabilities=[],
  resourceRules=[]
}={}){
  const reasons=[];

  if(deniedCapabilities.includes(capability)) reasons.push('capability-denied');
  if(allowedCapabilities.length&&!allowedCapabilities.includes(capability)) reasons.push('capability-not-allowed');

  for(const rule of resourceRules){
    const matchesCapability=rule.capability==='*'||rule.capability===capability;
    const matchesResource=rule.resource==='*'||rule.resource===resource;
    if(matchesCapability&&matchesResource&&rule.effect==='deny') reasons.push(`resource-denied:${rule.id||'rule'}`);
  }

  if(!actor?.id) reasons.push('actor-required');

  return {
    allowed:reasons.length===0,
    reasons,
    actorId:actor?.id||null,
    capability,
    resource,
    context:structuredClone(context)
  };
}

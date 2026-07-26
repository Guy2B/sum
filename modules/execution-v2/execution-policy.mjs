export function evaluateExecutionPolicy(intent,{
  maximumRisk='medium',
  requireApprovalFor=['high','critical'],
  allowedCapabilities=[]
}={}){
  const rank={low:0,medium:1,high:2,critical:3};
  const reasons=[];
  const actions=[];

  for(const action of intent.actions||[]){
    const risk=action.risk||'low';
    if(rank[risk]>rank[maximumRisk]) reasons.push(`risk-too-high:${action.id}`);
    if(allowedCapabilities.length&&!allowedCapabilities.includes(action.capability)){
      reasons.push(`capability-not-allowed:${action.capability}`);
    }
    actions.push({
      actionId:action.id,
      risk,
      approvalRequired:requireApprovalFor.includes(risk)||Boolean(action.requiresApproval)
    });
  }

  return {
    accepted:reasons.length===0,
    reasons,
    actions
  };
}

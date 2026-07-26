export function createRecoveryPlan({
  id,
  name,
  triggerTypes=[],
  steps=[],
  objective={},
  ownerId=null
}={}){
  if(!id||!name) throw new Error('recovery plan id and name are required');
  return {
    id,
    name,
    triggerTypes:[...new Set(triggerTypes)],
    steps:steps.map(step=>structuredClone(step)),
    objective:structuredClone(objective),
    ownerId,
    status:'ready'
  };
}

export function createExecutionIntent({
  id,
  title,
  actorId,
  objective,
  actions=[],
  constraints=[],
  approval='required',
  metadata={}
}={}){
  if(!id||!title||!actorId||!objective) throw new Error('execution intent id, title, actorId and objective are required');
  return {
    id,
    title,
    actorId,
    objective,
    actions:actions.map(action=>structuredClone(action)),
    constraints:constraints.map(item=>structuredClone(item)),
    approval,
    metadata:structuredClone(metadata),
    status:'draft',
    createdAt:new Date().toISOString()
  };
}

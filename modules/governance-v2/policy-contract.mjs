export function createPolicy({
  id,
  name,
  version='1.0.0',
  effect='allow',
  resource='*',
  actions=[],
  conditions=[]
}={}){
  if(!id||!name) throw new Error('policy id and name are required');
  if(!['allow','deny'].includes(effect)) throw new Error('policy effect must be allow or deny');
  return {
    id,
    name,
    version,
    effect,
    resource,
    actions:[...new Set(actions)],
    conditions:conditions.map(condition=>structuredClone(condition))
  };
}

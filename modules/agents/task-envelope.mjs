export function createTaskEnvelope({id,goal,input={},priority=.5,deadline=null,requiredCapabilities=[]}={}) {
  if(!id||!goal) throw new Error('task id and goal are required');
  return {id,goal,input:structuredClone(input),priority:Math.max(0,Math.min(1,priority)),deadline,requiredCapabilities:[...new Set(requiredCapabilities)],status:'queued'};
}

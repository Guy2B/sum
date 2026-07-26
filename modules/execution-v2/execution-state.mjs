export function createExecutionState({id,intentId}={}){
  if(!id||!intentId) throw new Error('execution id and intentId are required');
  return {
    id,
    intentId,
    status:'pending',
    currentAction:null,
    completedActions:[],
    failedActions:[],
    output:{},
    startedAt:null,
    completedAt:null
  };
}

export function transitionExecutionState(state,status,patch={}){
  return {
    ...structuredClone(state),
    ...structuredClone(patch),
    status
  };
}

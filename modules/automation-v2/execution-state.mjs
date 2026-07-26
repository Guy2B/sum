export function createExecutionState({workflowId,input={}}={}){
  if(!workflowId) throw new Error('workflowId is required');
  return {
    id:`execution_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    workflowId,status:'pending',input:structuredClone(input),output:null,
    currentStep:null,history:[],startedAt:null,completedAt:null
  };
}
export function transitionExecution(state,status,details={}){
  const timestamp=new Date().toISOString();
  return {
    ...structuredClone(state),
    ...structuredClone(details),
    status,
    history:[...(state.history||[]),{status,timestamp,...structuredClone(details)}]
  };
}

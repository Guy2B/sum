export function createExecutionReport({
  execution,
  journal=[],
  approvals=[],
  rollback=[]
}={}){
  if(!execution) throw new Error('execution is required');
  return {
    executionId:execution.id,
    intentId:execution.intentId,
    status:execution.status,
    completedActions:[...(execution.completedActions||[])],
    failedActions:[...(execution.failedActions||[])],
    approvals:approvals.map(item=>structuredClone(item)),
    rollback:rollback.map(item=>structuredClone(item)),
    journal:journal.map(item=>structuredClone(item)),
    generatedAt:new Date().toISOString()
  };
}

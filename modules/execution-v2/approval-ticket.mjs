export function createApprovalTicket({
  id,
  executionId,
  actionId,
  summary,
  risk='medium',
  requestedBy,
  expiresAt=null
}={}){
  if(!id||!executionId||!actionId||!summary||!requestedBy) throw new Error('approval ticket fields are required');
  return {
    id,
    executionId,
    actionId,
    summary,
    risk,
    requestedBy,
    expiresAt,
    status:'pending',
    requestedAt:new Date().toISOString()
  };
}

export function decideApproval(ticket,decision,decidedBy,reason=null){
  if(!['approved','rejected'].includes(decision)) throw new Error('invalid approval decision');
  if(ticket.status!=='pending') throw new Error('approval is not pending');
  return {
    ...structuredClone(ticket),
    status:decision,
    decidedBy,
    reason,
    decidedAt:new Date().toISOString()
  };
}

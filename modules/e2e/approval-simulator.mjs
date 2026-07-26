export function simulateApproval(request,{decision='approved',actor='user'}={}) {
  return {...request,status:decision,actor,decidedAt:new Date().toISOString()};
}

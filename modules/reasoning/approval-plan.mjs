export function createApprovalPlan(plan,{threshold=.7}={}){
  return plan.map(step=>({...step,approvalRequired:Number(step.risk||0)>=threshold,status:'proposed'}));
}

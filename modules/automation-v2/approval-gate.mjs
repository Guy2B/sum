export function createApprovalGate({requiredFor=[]}={}){
  const approvals=new Map();
  return {
    requires(actionType){return requiredFor.includes(actionType);},
    request(executionId,step){
      const id=`approval_${executionId}_${step.id}`;
      const item={id,executionId,stepId:step.id,status:'pending'};
      approvals.set(id,item);
      return structuredClone(item);
    },
    decide(id,decision,actor='user'){
      if(!['approved','rejected'].includes(decision)) throw new Error('invalid decision');
      const item=approvals.get(id);
      if(!item) throw new Error('unknown approval');
      const updated={...item,status:decision,actor,decidedAt:new Date().toISOString()};
      approvals.set(id,updated);
      return structuredClone(updated);
    },
    get(id){const item=approvals.get(id);return item?structuredClone(item):null;}
  };
}

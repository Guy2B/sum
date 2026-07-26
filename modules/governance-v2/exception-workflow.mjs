export function createExceptionWorkflow(){
  const exceptions=new Map();
  return {
    request({id,policyId,reason,requestedBy,expiresAt=null}={}){
      if(!id||!policyId||!reason||!requestedBy) throw new Error('exception fields are required');
      const item={
        id,policyId,reason,requestedBy,expiresAt,
        status:'pending',
        requestedAt:new Date().toISOString()
      };
      exceptions.set(id,item);
      return structuredClone(item);
    },
    decide(id,status,decidedBy){
      if(!['approved','rejected'].includes(status)) throw new Error('invalid exception decision');
      const item=exceptions.get(id);
      if(!item) throw new Error('unknown exception');
      item.status=status;
      item.decidedBy=decidedBy;
      item.decidedAt=new Date().toISOString();
      exceptions.set(id,item);
      return structuredClone(item);
    },
    get(id){const item=exceptions.get(id);return item?structuredClone(item):null;}
  };
}

export function createRecoveryAudit(){
  const entries=[];

  return {
    record(entry){
      const item={
        sequence:entries.length+1,
        timestamp:new Date().toISOString(),
        ...structuredClone(entry)
      };
      entries.push(item);
      return structuredClone(item);
    },
    list(filters={}){
      return entries
        .filter(item=>!filters.planId||item.planId===filters.planId)
        .filter(item=>!filters.executionId||item.executionId===filters.executionId)
        .filter(item=>!filters.status||item.status===filters.status)
        .map(item=>structuredClone(item));
    }
  };
}

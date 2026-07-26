export function createPlanningAudit(){
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
        .filter(item=>!filters.goalId||item.goalId===filters.goalId)
        .filter(item=>!filters.type||item.type===filters.type)
        .map(item=>structuredClone(item));
    }
  };
}

export function createExecutionJournal(){
  const entries=[];

  return {
    append(entry){
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
        .filter(item=>!filters.executionId||item.executionId===filters.executionId)
        .filter(item=>!filters.actionId||item.actionId===filters.actionId)
        .filter(item=>!filters.status||item.status===filters.status)
        .map(item=>structuredClone(item));
    }
  };
}

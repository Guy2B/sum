export function createCheckpointStore(){
  const checkpoints=new Map();

  return {
    save({executionId,stepId,state}={}){
      if(!executionId||!stepId) throw new Error('executionId and stepId are required');
      const key=`${executionId}:${stepId}`;
      const item={
        executionId,
        stepId,
        state:structuredClone(state),
        savedAt:new Date().toISOString()
      };
      checkpoints.set(key,item);
      return structuredClone(item);
    },
    load(executionId,stepId){
      const item=checkpoints.get(`${executionId}:${stepId}`);
      return item?structuredClone(item):null;
    },
    latest(executionId){
      return [...checkpoints.values()]
        .filter(item=>item.executionId===executionId)
        .sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt))[0]||null;
    }
  };
}

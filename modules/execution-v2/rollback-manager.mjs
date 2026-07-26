export function createRollbackManager(){
  const handlers=new Map();

  return {
    register(capability,handler){
      if(!capability||typeof handler!=='function') throw new Error('rollback capability and handler are required');
      handlers.set(capability,handler);
    },

    async rollback(completedActions=[],context={}){
      const results=[];
      for(const action of [...completedActions].reverse()){
        const handler=handlers.get(action.capability);
        if(!handler){
          results.push({actionId:action.id,status:'skipped'});
          continue;
        }
        try{
          const result=await handler(structuredClone(action),structuredClone(context));
          results.push({actionId:action.id,status:'rolled-back',result});
        }catch(error){
          results.push({actionId:action.id,status:'rollback-failed',error:error.message});
        }
      }
      return results;
    }
  };
}

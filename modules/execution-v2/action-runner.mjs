import {createIdempotencyStore} from './idempotency-store.mjs';

export function createActionRunner({capabilities,journal,idempotency=createIdempotencyStore()}={}){
  if(!capabilities||!journal) throw new Error('capabilities and journal are required');

  return {
    async run(action,context={}){
      const key=action.idempotencyKey||`${context.executionId}:${action.id}`;
      const existing=idempotency.get(key);
      if(existing){
        journal.append({
          type:'action-reused',
          executionId:context.executionId,
          actionId:action.id,
          status:'reused'
        });
        return {reused:true,result:existing.value};
      }

      journal.append({
        type:'action-started',
        executionId:context.executionId,
        actionId:action.id,
        status:'running'
      });

      try{
        const result=await capabilities.execute(action.capability,action.input||{},context);
        idempotency.set(key,result);
        journal.append({
          type:'action-completed',
          executionId:context.executionId,
          actionId:action.id,
          status:'completed'
        });
        return {reused:false,result};
      }catch(error){
        journal.append({
          type:'action-failed',
          executionId:context.executionId,
          actionId:action.id,
          status:'failed',
          error:error.message
        });
        throw error;
      }
    }
  };
}

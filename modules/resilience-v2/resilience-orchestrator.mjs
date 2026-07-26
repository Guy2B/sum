import {createRecoveryAudit} from './recovery-audit.mjs';
import {createCircuitBreaker} from './circuit-breaker.mjs';
import {withTimeout} from './timeout-controller.mjs';

export function createResilienceOrchestrator({
  fallbacks=null,
  breakerOptions={}
}={}){
  const audit=createRecoveryAudit();
  const breakers=new Map();

  function breakerFor(service){
    if(!breakers.has(service)) breakers.set(service,createCircuitBreaker(breakerOptions));
    return breakers.get(service);
  }

  return {
    async execute({
      service,
      operation,
      input={},
      timeoutMs=1000,
      fallbackKey=null
    }={}){
      if(!service||typeof operation!=='function') throw new Error('service and operation are required');
      const breaker=breakerFor(service);

      if(!breaker.canExecute()){
        audit.record({type:'execution-blocked',service,status:'circuit-open'});
        if(fallbackKey&&fallbacks?.has(fallbackKey)){
          const result=await fallbacks.execute(fallbackKey,input,{service,reason:'circuit-open'});
          return {status:'fallback',result};
        }
        return {status:'blocked',reason:'circuit-open'};
      }

      try{
        const result=await withTimeout(()=>operation(structuredClone(input)),{timeoutMs});
        breaker.success();
        audit.record({type:'execution-completed',service,status:'completed'});
        return {status:'completed',result};
      }catch(error){
        breaker.failure();
        audit.record({type:'execution-failed',service,status:'failed',error:error.message});
        if(fallbackKey&&fallbacks?.has(fallbackKey)){
          const result=await fallbacks.execute(fallbackKey,input,{service,reason:error.message});
          return {status:'fallback',result,error:error.message};
        }
        return {status:'failed',error:error.message};
      }
    },

    breaker(service){
      return breakerFor(service).snapshot();
    },

    audit(filters={}){
      return audit.list(filters);
    }
  };
}

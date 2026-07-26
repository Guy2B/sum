import {createExecutionState,transitionExecution} from './execution-state.mjs';
import {resolveVariables} from './variable-resolver.mjs';
import {evaluateConditions} from './condition-engine.mjs';
import {executeWithRetry} from './retry-executor.mjs';

export function createWorkflowRunner({actions,approvalGate=null}={}){
  if(!actions) throw new Error('actions registry is required');
  return {
    async run(workflow,input={}){
      let state=createExecutionState({workflowId:workflow.id,input});
      state=transitionExecution(state,'running',{startedAt:new Date().toISOString()});
      const context={input:structuredClone(input),steps:{}};

      for(const step of workflow.steps){
        state.currentStep=step.id;
        const conditions=step.config?.conditions||[];
        if(conditions.length&&!evaluateConditions(conditions,context,step.config.conditionMode||'all')){
          state.history.push({status:'skipped',stepId:step.id,timestamp:new Date().toISOString()});
          continue;
        }
        if(approvalGate?.requires(step.type)){
          const approval=approvalGate.request(state.id,step);
          return transitionExecution(state,'waiting-approval',{approval,currentStep:step.id});
        }

        const config=resolveVariables(step.config||{},context);
        const result=await executeWithRetry(
          ()=>actions.execute(step.type,config,context),
          {maxAttempts:step.config?.maxAttempts||1}
        );

        if(!result.ok){
          state.history.push({status:'failed-step',stepId:step.id,error:result.error?.message||'action failed',timestamp:new Date().toISOString()});
          if(step.onError==='continue') continue;
          return transitionExecution(state,'failed',{error:result.error?.message||'action failed',currentStep:step.id});
        }

        context.steps[step.id]=structuredClone(result.value);
        state.history.push({status:'completed-step',stepId:step.id,timestamp:new Date().toISOString()});
      }

      return transitionExecution(state,'completed',{output:context,completedAt:new Date().toISOString(),currentStep:null});
    }
  };
}

import {createWorkflowStore} from './workflow-store.mjs';
import {createAutomationAudit} from './automation-audit.mjs';

export function createAutomationOrchestrator({runner,triggerRegistry}={}){
  if(!runner||!triggerRegistry) throw new Error('runner and triggerRegistry are required');
  const store=createWorkflowStore();
  const audit=createAutomationAudit();

  return {
    register(workflow){
      const saved=store.save(workflow);
      audit.record({type:'workflow-registered',workflowId:workflow.id,status:'registered'});
      return saved;
    },
    async dispatch(triggerType,event={}){
      const executions=[];
      for(const workflow of store.list().filter(item=>item.enabled&&item.trigger.type===triggerType)){
        const matched=await triggerRegistry.evaluate(triggerType,event,workflow.trigger.config||{});
        if(!matched) continue;
        const execution=await runner.run(workflow,event);
        audit.record({type:'workflow-executed',workflowId:workflow.id,executionId:execution.id,status:execution.status});
        executions.push(execution);
      }
      return executions;
    },
    workflows(){return store.list();},
    audit(filters={}){return audit.list(filters);}
  };
}

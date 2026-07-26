import {createExecutionState,transitionExecutionState} from './execution-state.mjs';
import {createExecutionJournal} from './execution-journal.mjs';
import {createActionRunner} from './action-runner.mjs';
import {evaluateExecutionPolicy} from './execution-policy.mjs';

export function createExecutionOrchestrator({
  capabilities,
  permissionBoundary=null,
  policy={},
  approvalResolver=null
}={}){
  if(!capabilities) throw new Error('capabilities are required');

  const journal=createExecutionJournal();
  const runner=createActionRunner({capabilities,journal});

  return {
    async execute(intent,{actor={id:intent.actorId},resource='default'}={}){
      const policyDecision=evaluateExecutionPolicy(intent,policy);
      if(!policyDecision.accepted){
        journal.append({
          type:'execution-rejected',
          executionId:intent.id,
          status:'rejected',
          reasons:policyDecision.reasons
        });
        return {
          id:intent.id,
          intentId:intent.id,
          status:'rejected',
          reasons:policyDecision.reasons,
          completedActions:[],
          failedActions:[]
        };
      }

      let state=createExecutionState({id:`execution_${intent.id}`,intentId:intent.id});
      state=transitionExecutionState(state,'running',{startedAt:new Date().toISOString()});

      for(const action of intent.actions){
        state.currentAction=action.id;

        if(permissionBoundary){
          const permission=permissionBoundary({
            actor,
            capability:action.capability,
            resource,
            context:{intentId:intent.id,actionId:action.id}
          });
          if(!permission.allowed){
            state.failedActions.push(action.id);
            return transitionExecutionState(state,'failed',{
              error:'permission-denied',
              reasons:permission.reasons
            });
          }
        }

        const policyAction=policyDecision.actions.find(item=>item.actionId===action.id);
        if(policyAction?.approvalRequired){
          if(typeof approvalResolver!=='function'){
            return transitionExecutionState(state,'waiting-approval',{
              pendingAction:action.id
            });
          }
          const approved=await approvalResolver(action,{intent,state});
          if(!approved){
            state.failedActions.push(action.id);
            return transitionExecutionState(state,'rejected',{
              error:'approval-rejected',
              pendingAction:action.id
            });
          }
        }

        try{
          const outcome=await runner.run(action,{
            executionId:state.id,
            intentId:intent.id,
            actorId:actor.id
          });
          state.output[action.id]=structuredClone(outcome.result);
          state.completedActions.push(action.id);
        }catch(error){
          state.failedActions.push(action.id);
          return transitionExecutionState(state,'failed',{
            error:error.message,
            currentAction:action.id
          });
        }
      }

      return transitionExecutionState(state,'completed',{
        currentAction:null,
        completedAt:new Date().toISOString()
      });
    },

    journal(filters={}){
      return journal.list(filters);
    }
  };
}

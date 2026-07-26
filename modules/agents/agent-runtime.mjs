import {routeTask} from './capability-router.mjs';
import {planSteps} from './step-planner.mjs';
import {evaluateToolUse} from './tool-policy.mjs';
import {createExecutionJournal} from './execution-journal.mjs';

export function createAgentRuntime({agents=[],policy={allowedTools:[]}}={}){
  const journal=createExecutionJournal();
  return {
    prepare(task){
      const agent=routeTask(task,agents);
      if(!agent) throw new Error('no capable agent');
      const steps=planSteps(task);
      journal.append({type:'prepared',taskId:task.id,agentId:agent.id,steps:steps.length});
      return {agent,steps};
    },
    authorize(step,tool){
      const decision=evaluateToolUse({tool,action:step.action,risk:step.risk},policy);
      journal.append({type:'authorization',taskId:step.taskId,stepId:step.id,decision});
      return decision;
    },
    journal(){return journal.list();}
  };
}

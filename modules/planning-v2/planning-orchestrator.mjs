import {createPlanningAudit} from './planning-audit.mjs';
import {rankPriorities} from './priority-engine.mjs';
import {optimizePlan} from './plan-optimizer.mjs';
import {calculateProgress} from './progress-tracker.mjs';

export function createPlanningOrchestrator(){
  const goals=new Map();
  const tasks=new Map();
  const audit=createPlanningAudit();

  return {
    registerGoal(goal){
      goals.set(goal.id,structuredClone(goal));
      audit.record({type:'goal-registered',goalId:goal.id});
      return structuredClone(goal);
    },

    registerTasks(goalId,newTasks=[]){
      if(!goals.has(goalId)) throw new Error('unknown goal');
      for(const task of newTasks){
        tasks.set(task.id,{...structuredClone(task),goalId});
      }
      audit.record({type:'tasks-registered',goalId,count:newTasks.length});
      return newTasks.length;
    },

    buildPlan(goalId,{
      capacityHours=Infinity,
      weights={}
    }={}){
      if(!goals.has(goalId)) throw new Error('unknown goal');
      const goalTasks=[...tasks.values()].filter(task=>task.goalId===goalId);
      const ranked=rankPriorities(goalTasks,weights);
      const optimized=optimizePlan(
        ranked.map(task=>({...task,priority:task.priority.score})),
        {capacityHours}
      );
      audit.record({
        type:'plan-built',
        goalId,
        selected:optimized.selected.length,
        deferred:optimized.deferred.length
      });
      return {goal:structuredClone(goals.get(goalId)),ranked,...optimized};
    },

    progress(goalId){
      const goalTasks=[...tasks.values()].filter(task=>task.goalId===goalId);
      return calculateProgress(goalTasks);
    },

    updateTask(taskId,patch={}){
      const task=tasks.get(taskId);
      if(!task) throw new Error('unknown task');
      const updated={...task,...structuredClone(patch)};
      tasks.set(taskId,updated);
      audit.record({type:'task-updated',goalId:updated.goalId,taskId});
      return structuredClone(updated);
    },

    audit(filters={}){
      return audit.list(filters);
    }
  };
}

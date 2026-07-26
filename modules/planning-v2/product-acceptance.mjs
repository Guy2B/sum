export function validatePlanningOrchestrator(orchestrator){
  const required=['registerGoal','registerTasks','buildPlan','progress','updateTask','audit'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

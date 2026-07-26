export function createPlan(goal,steps=[]){
  if(!goal) throw new Error('goal is required');
  return {
    id:`plan_${Date.now()}`,
    goal,
    status:'planned',
    steps:steps.map((step,index)=>({
      id:step.id||`step_${index+1}`,
      title:step.title||String(step),
      dependsOn:[...(step.dependsOn||[])],
      status:'pending'
    }))
  };
}

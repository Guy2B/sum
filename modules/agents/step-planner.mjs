export function planSteps(task,{strategy='sequential'}={}){
  const requested=Array.isArray(task.input?.steps)?task.input.steps:[];
  return requested.map((step,index)=>({id:`${task.id}:step:${index+1}`,taskId:task.id,sequence:index+1,strategy,action:step.action||step,status:'planned',risk:Number(step.risk||0)}));
}

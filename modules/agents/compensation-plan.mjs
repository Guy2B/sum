export function buildCompensationPlan(executedSteps=[]){
  return [...executedSteps].reverse().filter(s=>s.compensation).map((s,index)=>({sequence:index+1,forStep:s.id,action:s.compensation,status:'planned'}));
}

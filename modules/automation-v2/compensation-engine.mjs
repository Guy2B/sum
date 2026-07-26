export async function compensate(completedSteps=[],context={}){
  const results=[];
  for(const step of [...completedSteps].reverse()){
    if(typeof step.compensate!=='function') continue;
    try{
      results.push({stepId:step.id,ok:true,value:await step.compensate(structuredClone(context))});
    }catch(error){
      results.push({stepId:step.id,ok:false,error:error.message});
    }
  }
  return results;
}

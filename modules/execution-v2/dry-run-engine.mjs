export async function runDryRun(actions=[],{
  simulate
}={}){
  if(typeof simulate!=='function') throw new Error('simulate is required');
  const results=[];

  for(const action of actions){
    try{
      const outcome=await simulate(structuredClone(action));
      results.push({
        actionId:action.id,
        status:'simulated',
        outcome:structuredClone(outcome)
      });
    }catch(error){
      results.push({
        actionId:action.id,
        status:'failed',
        error:error.message
      });
    }
  }

  return {
    ok:results.every(item=>item.status==='simulated'),
    results
  };
}

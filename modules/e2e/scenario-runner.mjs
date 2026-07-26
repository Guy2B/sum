export async function runScenario(scenario, handlers={}) {
  const trace=[]; let state={};
  for(const step of scenario.steps){
    const handler=handlers[step.kind];
    if(typeof handler!=='function') throw new Error(`missing handler: ${step.kind}`);
    const output=await handler(step.input,state);
    state={...state,[step.kind]:output};
    trace.push({kind:step.kind,output});
  }
  return {scenarioId:scenario.id,ok:true,state,trace};
}

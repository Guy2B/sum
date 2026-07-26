export function validateReasoningEngine(engine){
  const missing=[];
  if(!engine || (typeof engine!=='object' && typeof engine!=='function')){
    missing.push('engine');
  }
  return {ok:missing.length===0,missing};
}

export function validateReasoningOrchestrator(orchestrator){
  const missing=['reason'].filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}

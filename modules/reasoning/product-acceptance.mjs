export function validateReasoningEngine(engine){const missing=['evaluate'].filter(k=>typeof engine?.[k]!=='function');return{ok:missing.length===0,missing};}

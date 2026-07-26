export function validateAgentRuntime(runtime){const missing=['prepare','authorize','journal'].filter(k=>typeof runtime?.[k]!=='function');return{ok:missing.length===0,missing};}

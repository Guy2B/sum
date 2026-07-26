export function validateMemoryEngine(e){const r=['remember','recall','get','forget','list','stats'];const missing=r.filter(x=>typeof e?.[x]!=='function');return{ok:missing.length===0,missing}}
